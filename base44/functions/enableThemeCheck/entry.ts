import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { githubToken, getFileContent, commitFile } from "../../shared/github.ts";

const WORKFLOW_PATH = ".github/workflows/shopify-theme-check.yml";

const WORKFLOW = `name: Shopify Theme Check
# Added by Fixify.AI — lints Liquid, JSON templates and section schemas on every
# push and pull request so theme errors fail CI before they reach the storefront.
on:
  push:
  pull_request:

jobs:
  theme-check:
    name: Theme Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Shopify/theme-check-action@v2
        with:
          token: \${{ github.token }}
`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { monitored_repo_id } = await req.json();
    if (!monitored_repo_id) return Response.json({ error: "monitored_repo_id is required" }, { status: 400 });

    const svc = base44.asServiceRole;
    const rec = await svc.entities.MonitoredRepo.get(monitored_repo_id);
    if (!rec) return Response.json({ error: "Repository not found" }, { status: 404 });

    const repo = rec.full_name;
    const branch = rec.default_branch || "main";
    const token = await githubToken(base44);

    const existing = await getFileContent(token, repo, WORKFLOW_PATH, branch).catch(() => null);
    if (existing && existing.text.includes("Shopify/theme-check-action")) {
      await svc.entities.MonitoredRepo.update(monitored_repo_id, { theme_check_enabled: true });
      return Response.json({ already_enabled: true, path: WORKFLOW_PATH });
    }

    await commitFile(token, repo, {
      branch,
      path: WORKFLOW_PATH,
      content: WORKFLOW,
      sha: existing?.sha,
      message: "Fixify: add Shopify Theme Check to CI",
    });

    await svc.entities.MonitoredRepo.update(monitored_repo_id, { theme_check_enabled: true });

    return Response.json({
      enabled: true,
      path: WORKFLOW_PATH,
      workflow_url: `https://github.com/${repo}/actions`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}