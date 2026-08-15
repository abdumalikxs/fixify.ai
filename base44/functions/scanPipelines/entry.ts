import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { githubToken, listFailedRuns, listJobs, getJobLog, getFileContent } from "../../shared/github.ts";

const DIAGNOSIS_SCHEMA = {
  type: "object",
  properties: {
    error_type: { type: "string" },
    failure_summary: { type: "string" },
    file_path: { type: "string" },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["error_type", "failure_summary", "confidence"]
};

const PATCH_SCHEMA = {
  type: "object",
  properties: {
    fixed_content: { type: "string" },
    explanation: { type: "string" },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["fixed_content", "explanation", "confidence"]
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_e) { user = null; }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;
    const token = await githubToken(base44);
    const repos = await svc.entities.MonitoredRepo.filter({ enabled: true });
    const created = [];

    for (const repo of repos) {
      const runs = await listFailedRuns(token, repo.full_name, 3);
      const newRuns = runs.filter((r) => !repo.last_run_id || r.id > repo.last_run_id);
      const newest = runs[0];

      for (const run of newRuns.slice(0, 2)) {
        const jobs = await listJobs(token, repo.full_name, run.id);
        const failedJob = jobs.find((j) => j.conclusion === 'failure');
        if (!failedJob) continue;

        const log = await getJobLog(token, repo.full_name, failedJob.id);
        if (!log) continue;

        const diagnosis = await svc.integrations.Core.InvokeLLM({
          prompt: `You are a CI/CD failure analyst. A GitHub Actions job failed.

Repository: ${repo.full_name}
Workflow: ${run.name} / Job: ${failedJob.name}
Commit message: ${run.head_commit?.message || 'unknown'}

Here is the tail of the job log:
---
${log}
---

Identify the root cause. Return a short error_type (e.g. "Liquid syntax error", "ESLint failure", "Type error", "Missing dependency"), a one or two sentence failure_summary, and file_path: the single repository-relative path of the source file that must be edited to fix this (omit file_path only if the log genuinely does not point at one file). Judge your own confidence honestly.`,
          response_json_schema: DIAGNOSIS_SCHEMA,
          model: 'claude_sonnet_4_6'
        });

        const base = {
          repo_full_name: repo.full_name,
          run_id: run.id,
          run_url: run.html_url,
          workflow_name: run.name,
          job_name: failedJob.name,
          branch: run.head_branch,
          commit_sha: (run.head_sha || '').slice(0, 7),
          commit_message: run.head_commit?.message || '',
          error_type: diagnosis.error_type,
          failure_summary: diagnosis.failure_summary,
          log_excerpt: log.slice(-2500)
        };

        let file = null;
        if (diagnosis.file_path) {
          try {
            file = await getFileContent(token, repo.full_name, diagnosis.file_path, run.head_sha);
          } catch (_e) {
            file = null;
          }
        }

        if (!file) {
          const rec = await svc.entities.FixProposal.create({
            ...base,
            file_path: diagnosis.file_path || '',
            confidence: diagnosis.confidence,
            status: 'Diagnosis only',
            explanation: 'The agent could not locate a single source file to patch from the log, so it reported the diagnosis only.'
          });
          created.push(rec.id);
          continue;
        }

        const patch = await svc.integrations.Core.InvokeLLM({
          prompt: `You are an autonomous repair agent fixing a CI/CD failure.

Repository: ${repo.full_name}
Diagnosed problem: ${diagnosis.error_type} — ${diagnosis.failure_summary}
File to fix: ${diagnosis.file_path}

Relevant job log tail:
---
${log.slice(-4000)}
---

Current full contents of ${diagnosis.file_path}:
---
${file.text.slice(0, 20000)}
---

Return fixed_content: the COMPLETE corrected contents of that file, byte-for-byte ready to commit. Change only what is required to fix this failure — preserve all unrelated code, formatting and comments exactly. Never truncate the file or leave placeholder comments. Also return a short explanation of exactly what you changed and why, and your honest confidence.`,
          response_json_schema: PATCH_SCHEMA,
          model: 'claude_sonnet_4_6'
        });

        const rec = await svc.entities.FixProposal.create({
          ...base,
          file_path: diagnosis.file_path,
          broken_code: file.text.slice(0, 20000),
          proposed_code: patch.fixed_content,
          explanation: patch.explanation,
          confidence: patch.confidence,
          status: 'Proposed'
        });
        created.push(rec.id);
      }

      await svc.entities.MonitoredRepo.update(repo.id, {
        last_run_id: newest ? newest.id : repo.last_run_id,
        last_scanned_at: new Date().toISOString()
      });
    }

    return Response.json({ scanned_repos: repos.length, proposals_created: created.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}