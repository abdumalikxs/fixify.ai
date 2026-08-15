import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { githubToken, getFileContent, openFixPullRequest } from "../../shared/github.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { proposal_id } = await req.json();
    if (!proposal_id) return Response.json({ error: 'proposal_id is required' }, { status: 400 });

    const proposal = await base44.entities.FixProposal.get(proposal_id);
    if (!proposal) return Response.json({ error: 'Proposal not found' }, { status: 404 });
    if (!proposal.file_path || !proposal.proposed_code) {
      return Response.json({ error: 'This proposal has no patch to apply' }, { status: 400 });
    }

    const token = await githubToken(base44);
    const baseBranch = proposal.branch || 'main';
    const current = await getFileContent(token, proposal.repo_full_name, proposal.file_path, baseBranch);

    const { pr_url, branch } = await openFixPullRequest(token, proposal.repo_full_name, {
      baseBranch,
      filePath: proposal.file_path,
      newContent: proposal.proposed_code,
      fileSha: current?.sha,
      title: `Fixify: fix ${proposal.error_type || 'CI failure'} in ${proposal.file_path}`,
      body: `Automated fix proposed by Fixify.AI and approved by ${user.email}.\n\n**Failing run:** ${proposal.run_url}\n**Diagnosis:** ${proposal.failure_summary || ''}\n\n**What changed:** ${proposal.explanation || ''}`
    });

    await base44.entities.FixProposal.update(proposal_id, { status: 'Approved', pr_url });
    return Response.json({ pr_url, branch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}