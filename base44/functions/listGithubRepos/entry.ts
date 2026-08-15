import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { githubToken, listRepos } from "../../shared/github.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = await githubToken(base44);
    const repos = await listRepos(token);
    return Response.json({ repos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}