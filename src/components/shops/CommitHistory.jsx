import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search } from "lucide-react";
import RepoNotice from "./RepoNotice";

export default function CommitHistory({ repo }) {
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState(repo.default_branch || "main");
  const [commits, setCommits] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async (targetBranch, targetPage) => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("listRepoCommits", {
        repo: repo.full_name,
        branch: targetBranch,
        page: targetPage,
      });
      const data = res.data;
      setBranches(data.branches || []);
      setCommits((prev) => (targetPage === 1 ? data.commits : [...prev, ...data.commits]));
      setHasMore(!!data.has_more);
      setPage(targetPage);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not load commit history.");
    }
    setLoading(false);
  }, [repo.full_name]);

  useEffect(() => {
    setBranch(repo.default_branch || "main");
    load(repo.default_branch || "main", 1);
  }, [repo.full_name, repo.default_branch, load]);

  const pickBranch = (b) => {
    setBranch(b);
    load(b, 1);
  };

  const filtered = commits.filter((c) => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return c.message.toLowerCase().includes(t) || c.author_name.toLowerCase().includes(t);
  });

  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#e3e3e3] px-4 py-3">
        <p className="font-mono text-xs">{repo.full_name}</p>
        <select
          value={branch}
          onChange={(e) => pickBranch(e.target.value)}
          className="rounded-md border border-[#e3e3e3] bg-white px-2 py-1 text-xs"
        >
          {(branches.length ? branches : [branch]).map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <div className="ml-auto relative">
          <Search className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-[#8a8a8a]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search commits"
            className="h-7 w-48 pl-7 text-xs"
          />
        </div>
      </div>

      {error && <RepoNotice rawError={error} />}

      <div className="divide-y divide-[#f1f1f1]">
        {filtered.map((c) => (
          <div key={c.sha} className="flex items-start gap-3 px-4 py-3">
            {c.author_avatar ? (
              <img src={c.author_avatar} alt="" className="mt-0.5 h-6 w-6 rounded-full" />
            ) : (
              <div className="mt-0.5 h-6 w-6 rounded-full bg-[#f1f1f1]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#1a1a1a]">{c.message.split("\n")[0]}</p>
              <p className="mt-0.5 text-[11px] text-[#8a8a8a]">
                {c.author_name} · {c.date ? new Date(c.date).toLocaleString() : ""} · {branch}
              </p>
            </div>
            <a
              href={c.html_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-mono text-[11px] text-[#616161] hover:text-[#008060]"
            >
              {c.sha.slice(0, 7)} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-[#8a8a8a]">No commits match.</p>
        )}
      </div>

      <div className="border-t border-[#e3e3e3] px-4 py-3">
        {loading ? (
          <p className="text-xs text-[#8a8a8a]">Loading commits…</p>
        ) : hasMore ? (
          <Button size="sm" variant="outline" onClick={() => load(branch, page + 1)}>Load more</Button>
        ) : (
          <p className="text-xs text-[#8a8a8a]">{error ? "Nothing to show yet." : "End of history."}</p>
        )}
      </div>
    </div>
  );
}