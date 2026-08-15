import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { ToolLoopAgent, tool, stepCountIs, hasToolCall } from "npm:ai@7.0.16";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@3.0.5";
import { z } from "npm:zod@4.4.3";
import {
  githubToken,
  getRun,
  listJobs,
  getJobLog,
  getFileContent,
  getRepoTree,
  listCommits,
} from "../../shared/github.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { user = null; }
    if (user && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const repo = String(body.repo_full_name || "");
    const runId = Number(body.run_id);
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !runId) {
      return Response.json({ error: "repo_full_name and run_id are required" }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const token = await githubToken(base44);

    const run = await getRun(token, repo, runId);
    const jobs = await listJobs(token, repo, runId);
    const failedJob = jobs.find((j) => j.conclusion === "failure");
    if (!failedJob) return Response.json({ error: "No failed job in this run" }, { status: 404 });

    const log = await getJobLog(token, repo, failedJob.id);
    const ref = run.head_sha;

    const base = {
      repo_full_name: repo,
      run_id: runId,
      run_url: run.html_url,
      workflow_name: run.name,
      job_name: failedJob.name,
      branch: run.head_branch,
      commit_sha: (ref || "").slice(0, 7),
      commit_message: run.head_commit?.message || "",
      log_excerpt: (log || "").slice(-2500),
    };

    const readCache = {};
    let outcome = null;

    const { baseURL, token: gatewayToken } = svc.aiGateway.connection();
    const models = createOpenAICompatible({ name: "base44", baseURL, apiKey: gatewayToken });

    const agent = new ToolLoopAgent({
      model: models("automatic"),
      instructions: `You are Fixify, an autonomous CI/CD repair agent working on the GitHub repository ${repo} at commit ${ref}.

A GitHub Actions job failed. Investigate freely: list files, read any files you need, and look at recent commits to see what changed. Do not guess at file contents — read them.

Work like an engineer: find the root cause, confirm it by reading the actual source, then decide.
- If you can fix it by editing exactly ONE file, call proposeFix with the COMPLETE corrected contents of that file, byte-for-byte ready to commit. Change only what is required; preserve all unrelated code, formatting and comments. Never truncate or leave placeholder comments.
- If the failure needs no code change (flaky infrastructure, expired token, external outage) or spans multiple files, call reportDiagnosisOnly instead.

Call exactly one of those two tools once, as your final action. Be honest about confidence.`,
      tools: {
        listFiles: tool({
          description: "List repository file paths at the failing commit. Optional path prefix to narrow it down.",
          inputSchema: z.object({ prefix: z.string().optional() }),
          execute: ({ prefix }) => getRepoTree(token, repo, ref, prefix || ""),
        }),
        readFile: tool({
          description: "Read the full contents of a repository file at the failing commit.",
          inputSchema: z.object({ path: z.string() }),
          execute: async ({ path }) => {
            if (readCache[path]) return { path, content: readCache[path] };
            const file = await getFileContent(token, repo, path, ref);
            if (!file) return { path, error: "File not found at this commit" };
            readCache[path] = file.text.slice(0, 40000);
            return { path, content: readCache[path] };
          },
        }),
        recentCommits: tool({
          description: "The 10 most recent commits on the failing branch, to see what changed recently.",
          inputSchema: z.object({}),
          execute: () => listCommits(token, repo, { branch: run.head_branch, perPage: 10 }),
        }),
        proposeFix: tool({
          description: "Submit a one-file patch for human approval. Final action.",
          inputSchema: z.object({
            file_path: z.string(),
            fixed_content: z.string(),
            error_type: z.string(),
            failure_summary: z.string(),
            explanation: z.string(),
            confidence: z.enum(["high", "medium", "low"]),
          }),
          execute: async (args) => {
            const rec = await svc.entities.FixProposal.create({
              ...base,
              error_type: args.error_type,
              failure_summary: args.failure_summary,
              file_path: args.file_path,
              broken_code: (readCache[args.file_path] || "").slice(0, 20000),
              proposed_code: args.fixed_content,
              explanation: args.explanation,
              confidence: args.confidence,
              status: "Proposed",
            });
            outcome = { proposal_id: rec.id, status: "Proposed" };
            return { saved: true };
          },
        }),
        reportDiagnosisOnly: tool({
          description: "Record a diagnosis when no single-file code fix applies. Final action.",
          inputSchema: z.object({
            error_type: z.string(),
            failure_summary: z.string(),
            explanation: z.string(),
            confidence: z.enum(["high", "medium", "low"]),
            file_path: z.string().optional(),
          }),
          execute: async (args) => {
            const rec = await svc.entities.FixProposal.create({
              ...base,
              error_type: args.error_type,
              failure_summary: args.failure_summary,
              file_path: args.file_path || "",
              explanation: args.explanation,
              confidence: args.confidence,
              status: "Diagnosis only",
            });
            outcome = { proposal_id: rec.id, status: "Diagnosis only" };
            return { saved: true };
          },
        }),
      },
      stopWhen: [stepCountIs(14), hasToolCall("proposeFix"), hasToolCall("reportDiagnosisOnly")],
    });

    await agent.generate({
      prompt: `Workflow "${run.name}", job "${failedJob.name}" failed on branch ${run.head_branch}.
Commit message: ${run.head_commit?.message || "unknown"}

Tail of the failing job log:
---
${(log || "(log unavailable)").slice(-9000)}
---

Investigate and finish with proposeFix or reportDiagnosisOnly.`,
    });

    if (!outcome) {
      const rec = await svc.entities.FixProposal.create({
        ...base,
        error_type: "Unresolved",
        failure_summary: "The agent stopped before reaching a conclusion.",
        status: "Diagnosis only",
        confidence: "low",
        explanation: "The investigation hit its step limit without submitting a fix or diagnosis.",
      });
      outcome = { proposal_id: rec.id, status: "Diagnosis only" };
    }

    return Response.json(outcome);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}