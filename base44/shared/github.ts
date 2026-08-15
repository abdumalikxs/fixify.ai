const API = "https://api.github.com";

export async function githubToken(base44) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");
  return accessToken;
}

async function gh(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Fixify-AI",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${init.method || "GET"} ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}

export async function listRepos(token) {
  const repos = await gh(token, "/user/repos?sort=pushed&per_page=100");
  return repos.map((r) => ({
    full_name: r.full_name,
    default_branch: r.default_branch,
    private: r.private,
    pushed_at: r.pushed_at,
  }));
}

export async function listBranches(token, repo) {
  const data = await gh(token, `/repos/${repo}/branches?per_page=100`);
  return data.map((b) => b.name);
}

export async function listCommits(token, repo, { branch, page = 1, perPage = 30 } = {}) {
  const q = new URLSearchParams({ per_page: String(perPage), page: String(page) });
  if (branch) q.set("sha", branch);
  const data = await gh(token, `/repos/${repo}/commits?${q.toString()}`);
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit?.message || "",
    author_name: c.commit?.author?.name || c.author?.login || "unknown",
    author_avatar: c.author?.avatar_url || null,
    date: c.commit?.author?.date || null,
    html_url: c.html_url,
  }));
}

export async function listFailedRuns(token, repo, perPage = 5) {
  const data = await gh(token, `/repos/${repo}/actions/runs?status=failure&per_page=${perPage}`);
  return data.workflow_runs || [];
}

export async function listRunsForSha(token, repo, sha) {
  const data = await gh(token, `/repos/${repo}/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=10`);
  return data.workflow_runs || [];
}

export async function getRun(token, repo, runId) {
  return gh(token, `/repos/${repo}/actions/runs/${runId}`);
}

export async function getRepoTree(token, repo, ref, prefix = "") {
  const data = await gh(token, `/repos/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`);
  const paths = (data.tree || []).filter((n) => n.type === "blob").map((n) => n.path);
  const filtered = prefix ? paths.filter((p) => p.startsWith(prefix)) : paths;
  return { paths: filtered.slice(0, 400), truncated: filtered.length > 400 || !!data.truncated };
}

export async function listJobs(token, repo, runId) {
  const data = await gh(token, `/repos/${repo}/actions/runs/${runId}/jobs?per_page=30`);
  return data.jobs || [];
}

export async function getJobLog(token, repo, jobId, tailChars = 9000) {
  const res = await fetch(`${API}/repos/${repo}/actions/jobs/${jobId}/logs`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "Fixify-AI" },
    redirect: "follow",
  });
  if (!res.ok) return "";
  const text = await res.text();
  return text.slice(-tailChars);
}

export async function getFileContent(token, repo, path, ref) {
  const data = await gh(token, `/repos/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`);
  if (!data.content) return null;
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  return { text: new TextDecoder().decode(bytes), sha: data.sha };
}

function encodeContent(text) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

export async function commitFile(token, repo, { branch, path, content, sha, message }) {
  await gh(token, `/repos/${repo}/contents/${encodeURI(path)}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: encodeContent(content), branch, ...(sha ? { sha } : {}) }),
  });
}

// Makes sure the repo's CI workflows also run on pull requests, so a Fixify fix
// branch is verified by the same checks before anyone merges it.
export async function ensurePullRequestChecks(token, repo, branch) {
  let files = [];
  try {
    files = await gh(token, `/repos/${repo}/contents/.github/workflows?ref=${encodeURIComponent(branch)}`);
  } catch (_e) {
    return { updated: [] };
  }
  const updated = [];
  for (const f of files.filter((x) => /\.ya?ml$/.test(x.name))) {
    const file = await getFileContent(token, repo, f.path, branch);
    if (!file || /pull_request/.test(file.text)) continue;
    if (!/^on:\s*$/m.test(file.text)) continue;
    const patched = file.text.replace(/^on:\s*$/m, "on:\n  pull_request:");
    await commitFile(token, repo, {
      branch,
      path: f.path,
      content: patched,
      sha: file.sha,
      message: `Fixify: run ${f.name} on pull requests`,
    });
    updated.push(f.path);
  }
  return { updated };
}

export async function openFixPullRequest(token, repo, { baseBranch, filePath, newContent, fileSha, title, body }) {
  const baseRef = await gh(token, `/repos/${repo}/git/ref/heads/${baseBranch}`);
  const newBranch = `fixify/fix-${Date.now()}`;
  await gh(token, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: baseRef.object.sha }),
  });
  await commitFile(token, repo, { branch: newBranch, path: filePath, content: newContent, sha: fileSha, message: title });
  const checks = await ensurePullRequestChecks(token, repo, newBranch);
  const pr = await gh(token, `/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, head: newBranch, base: baseBranch, body }),
  });
  return { pr_url: pr.html_url, pr_number: pr.number, branch: newBranch, checks_enabled_in: checks.updated };
}

export async function getPullRequestStatus(token, repo, prNumber) {
  const pr = await gh(token, `/repos/${repo}/pulls/${prNumber}`);
  const runs = await gh(token, `/repos/${repo}/commits/${pr.head.sha}/check-runs`);
  const checks = (runs.check_runs || []).map((c) => ({
    name: c.name,
    status: c.status,
    conclusion: c.conclusion,
    url: c.html_url,
  }));
  const pending = checks.filter((c) => c.status !== "completed");
  const failing = checks.filter((c) => c.conclusion && !["success", "neutral", "skipped"].includes(c.conclusion));
  let state = "no_checks";
  if (pending.length) state = "pending";
  else if (failing.length) state = "failing";
  else if (checks.length) state = "passing";
  return {
    pr_number: pr.number,
    pr_url: pr.html_url,
    head_branch: pr.head.ref,
    head_sha: pr.head.sha,
    merged: pr.merged,
    closed: pr.state === "closed",
    mergeable_state: pr.mergeable_state,
    checks,
    state,
  };
}

export async function mergePullRequest(token, repo, prNumber, title) {
  const res = await gh(token, `/repos/${repo}/pulls/${prNumber}/merge`, {
    method: "PUT",
    body: JSON.stringify({ merge_method: "squash", commit_title: title }),
  });
  return { merged: !!res.merged, sha: res.sha };
}