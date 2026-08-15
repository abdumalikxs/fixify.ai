import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { githubToken, listFailedRuns } from "../../shared/github.ts";

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
    const results = [];

    for (const repo of repos) {
      const runs = await listFailedRuns(token, repo.full_name, 3);
      const newRuns = runs.filter((r) => !repo.last_run_id || r.id > repo.last_run_id);
      const newest = runs[0];

      for (const run of newRuns.slice(0, 2)) {
        try {
          const res = await base44.functions.invoke('healAgent', {
            repo_full_name: repo.full_name,
            run_id: run.id
          });
          results.push({ repo: repo.full_name, run_id: run.id, ...(res.data || {}) });
        } catch (e) {
          results.push({ repo: repo.full_name, run_id: run.id, error: e.message });
        }
      }

      await svc.entities.MonitoredRepo.update(repo.id, {
        last_run_id: newest ? newest.id : repo.last_run_id,
        last_scanned_at: new Date().toISOString()
      });
    }

    return Response.json({ scanned_repos: repos.length, investigations: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}