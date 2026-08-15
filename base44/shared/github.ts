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

export async function openFixPullRequest(token, repo, { baseBranch, filePath, newContent, fileSha, title, body }) {
  const baseRef = await gh(token, `/repos/${repo}/git/ref/heads/${baseBranch}`);
  const newBranch = `fixify/fix-${Date.now()}`;
  await gh(token, `/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: baseRef.object.sha }),
  });
  const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(newContent)));
  await gh(token, `/repos/${repo}/contents/${encodeURI(filePath)}`, {
    method: "PUT",
    body: JSON.stringify({
      message: title,
      content: encoded,
      branch: newBranch,
      ...(fileSha ? { sha: fileSha } : {}),
    }),
  });
  const pr = await gh(token, `/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, head: newBranch, base: baseBranch, body }),
  });
  return { pr_url: pr.html_url, branch: newBranch };
}