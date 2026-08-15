import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { githubToken, getPullRequestStatus } from "../../shared/github.ts";

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

    if (status.merged && proposal.status !== 'Merged') {
      await base44.entities.FixProposal.update(proposal_id, {
        status: 'Merged',
        merged_at: new Date().toISOString()
      });
    }

    return Response.json(status);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}