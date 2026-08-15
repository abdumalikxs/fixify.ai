import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { ToolLoopAgent, tool, stepCountIs, hasToolCall } from "npm:ai@7.0.16";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@3.0.5";
import { z } from "npm:zod@4.4.3";
import {
  githubToken,
  getPullRequestStatus,
  listRunsForSha,
  listJobs,
  getJobLog,
  getFileContent,
  getRepoTree,
  commitFile,
} from "../../shared/github.ts";

const MAX_RETRIES = 3;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { proposal_id } = await req.json();
    if (!proposal_id) return Response.json({ error: "proposal_id is required" }, { status: 400 });

    const proposal = await base44.entities.FixProposal.get(proposal_id);
    if (!proposal) return Response.json({ error: "Proposal not found" }, { status: 404 });
    if (!proposal.pr_number) return Response.json({ error: "This proposal has no pull request yet" }, { status: 400 });

    const attempt = (proposal.retry_count || 0) + 1;
    if (attempt > MAX_RETRIES) {
      return Response.json({ error: `The agent already retried ${MAX_RETRIES} times. Take it from here manually.` }, { status: 400 });
    }

    const repo = proposal.repo_full_name;
    const token = await githubToken(base44);
    const pr = await getPullRequestStatus(token, repo, proposal.pr_number);
    if (pr.merged || pr.closed) return Response.json({ error: "This pull request is already closed" }, { status: 400 });
    if (pr.state !== "failing") {
      return Response.json({ error: "The pull request checks are not failing, so there is nothing to retry" }, { status: 400 });
    }

    // Pull the log of whatever failed on the fix branch.
    const runs = await listRunsForSha(token, repo, pr.head_sha);
    const failedRun = runs.find((r) => r.conclusion === "failure");
    let log = "";
    let jobName = "";
    if (failedRun) {
      const jobs = await listJobs(token, repo, failedRun.id);
      const failedJob = jobs.find((j) => j.conclusion === "failure");
      if (failedJob) {
        jobName = failedJob.name;
        log = await getJobLog(token, repo, failedJob.id);
      }
    }
    if (!log) {
      log = pr.checks.map((c) => `${c.name}: ${c.conclusion || c.status}`).join("\n");
    }

    const branch = pr.head_branch;
    const readCache = {};
    let outcome = null;

    const { baseURL, token: gatewayToken } = base44.asServiceRole.aiGateway.connection();
    const models = createOpenAICompatible({ name: "base44", baseURL, apiKey: gatewayToken });

    const agent = new ToolLoopAgent({
      model: models("automatic"),
      instructions: `You are Fixify, an autonomous CI/CD repair agent. Your previous patch on branch ${branch} of ${repo} did NOT fix the build — CI is still failing (retry attempt ${attempt} of ${MAX_RETRIES}).

Your earlier attempt changed "${proposal.file_path}" with this reasoning: ${proposal.explanation || "(none recorded)"}

Read the new failing log carefully and figure out what your patch got wrong or missed. Investigate the branch as it stands now: list files, read any file you need. Never guess at file contents.

- If you can fix it by editing exactly ONE file on this branch, call reviseFix with the COMPLETE corrected contents of that file, byte-for-byte ready to commit. It will be pushed to the existing pull request. Change only what is required.
- If the remaining failure cannot be fixed in one file, or needs a human decision, call giveUp with an explanation.

Call exactly one of those tools once, as your final action.`,
      tools: {
        listFiles: tool({
          description: "List repository file paths on the fix branch. Optional path prefix to narrow it down.",
          inputSchema: z.object({ prefix: z.string().optional() }),
          execute: ({ prefix }) => getRepoTree(token, repo, branch, prefix || ""),
        }),
        readFile: tool({
          description: "Read the full contents of a repository file on the fix branch.",
          inputSchema: z.object({ path: z.string() }),
          execute: async ({ path }) => {
            if (readCache[path]) return { path, content: readCache[path] };
            const file = await getFileContent(token, repo, path, branch);
            if (!file) return { path, error: "File not found on this branch" };
            readCache[path] = file.text.slice(0, 40000);
            return { path, content: readCache[path], sha: file.sha };
          },
        }),
        reviseFix: tool({
          description: "Push a corrected version of one file to the existing pull request. Final action.",
          inputSchema: z.object({
            file_path: z.string(),
            fixed_content: z.string(),
            explanation: z.string(),
            confidence: z.enum(["high", "medium", "low"]),
          }),
          execute: async (args) => {
            const current = await getFileContent(token, repo, args.file_path, branch);
            await commitFile(token, repo, {
              branch,
              path: args.file_path,
              content: args.fixed_content,
              sha: current?.sha,
              message: `Fixify: revise fix (retry ${attempt}) in ${args.file_path}`,
            });
            outcome = {
              retried: true,
              attempt,
              file_path: args.file_path,
              proposed_code: args.fixed_content,
              explanation: args.explanation,
              confidence: args.confidence,
            };
            return { pushed: true };
          },
        }),
        giveUp: tool({
          description: "Report that the remaining failure needs a human. Final action.",
          inputSchema: z.object({ explanation: z.string() }),
          execute: ({ explanation }) => {
            outcome = { retried: false, attempt, explanation };
            return { recorded: true };
          },
        }),
      },
      stopWhen: [stepCountIs(14), hasToolCall("reviseFix"), hasToolCall("giveUp")],
    });

    await agent.generate({
      prompt: `Pull request #${proposal.pr_number} on ${repo} (branch ${branch}) is still failing CI${jobName ? `, job "${jobName}"` : ""}.

Check results: ${pr.checks.map((c) => `${c.name}=${c.conclusion || c.status}`).join(", ") || "unknown"}

Tail of the failing log:
---
${(log || "(log unavailable)").slice(-9000)}
---

Investigate and finish with reviseFix or giveUp.`,
    });

    if (!outcome) {
      outcome = { retried: false, attempt, explanation: "The agent stopped before reaching a conclusion." };
    }

    const stamp = `Retry ${attempt}: ${outcome.retried ? "pushed a revised patch" : "gave up"} — ${outcome.explanation}`;
    const update = {
      retry_count: attempt,
      retry_log: [proposal.retry_log, stamp].filter(Boolean).join("\n\n"),
    };
    if (outcome.retried) {
      update.file_path = outcome.file_path;
      update.broken_code = (readCache[outcome.file_path] || proposal.broken_code || "").slice(0, 20000);
      update.proposed_code = outcome.proposed_code;
      update.explanation = outcome.explanation;
      update.confidence = outcome.confidence;
    }
    await base44.entities.FixProposal.update(proposal_id, update);

    return Response.json(outcome);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}