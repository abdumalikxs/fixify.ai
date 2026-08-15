import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { githubToken, listBranches, listCommits } from "../../shared/github.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const repo = body.repo;
    if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      return Response.json({ error: 'A valid repo (owner/name) is required.' }, { status: 400 });
    }
    const page = Math.min(Math.max(parseInt(body.page) || 1, 1), 50);
    const branch = typeof body.branch === 'string' ? body.branch : undefined;
    const perPage = 30;

    const token = await githubToken(base44);
    const commits = await listCommits(token, repo, { branch, page, perPage });
    const branches = page === 1 ? await listBranches(token, repo) : [];

    return Response.json({ commits, branches, has_more: commits.length === perPage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}