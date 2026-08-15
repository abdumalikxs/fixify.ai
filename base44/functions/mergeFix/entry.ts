import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { githubToken, getPullRequestStatus, mergePullRequest } from "../../shared/github.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { proposal_id } = await req.json();
    if (!proposal_id) return Response.json({ error: 'proposal_id is required' }, { status: 400 });

    const proposal = await base44.entities.FixProposal.get(proposal_id);
    if (!proposal) return Response.json({ error: 'Proposal not found' }, { status: 404 });
    if (!proposal.pr_number) return Response.json({ error: 'This proposal has no pull request yet' }, { status: 400 });

    const token = await githubToken(base44);
    const status = await getPullRequestStatus(token, proposal.repo_full_name, proposal.pr_number);

    if (status.merged) {
      await base44.entities.FixProposal.update(proposal_id, { status: 'Merged' });
      return Response.json({ merged: true, already: true });
    }
    if (status.state === 'pending') {
      return Response.json({ error: 'CI checks are still running on this pull request.' }, { status: 409 });
    }
    if (status.state === 'failing') {
      return Response.json({ error: 'CI checks are failing on this pull request, so it was not merged.' }, { status: 409 });
    }

    const result = await mergePullRequest(
      token,
      proposal.repo_full_name,
      proposal.pr_number,
      `Fixify: fix ${proposal.error_type || 'CI failure'} in ${proposal.file_path}`
    );

    await base44.entities.FixProposal.update(proposal_id, {
      status: 'Merged',
      merge_commit_sha: result.sha,
      merged_at: new Date().toISOString()
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}