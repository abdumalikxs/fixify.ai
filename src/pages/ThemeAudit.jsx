import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ThemeIssueCard from "@/components/nocode/ThemeIssueCard";
import { THEME_FILES } from "@/data/luminaTheme";

export default function ThemeAudit() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [path, setPath] = useState("templates/index.json");
  const [paste, setPaste] = useState("");

  const load = useCallback(async () => {
    const list = await base44.entities.ThemeIssue.list("-created_date", 40);
    setIssues(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (kind, payload) => {
    setBusy(kind);
    setError("");
    try {
      const res = await base44.functions.invoke("auditTheme", payload);
      if (res.data?.found === 0) setError("No issues found — every file parsed cleanly.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || "The audit failed.");
    }
    setBusy("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">No-code theme audit</h1>
        <p className="mt-1 text-sm text-[#616161]">
          For stores with no repository. Fixify parses the theme's JSON and Liquid, finds what the theme editor
          broke, and drafts the corrected file for you to approve.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#e3e3e3] bg-white px-4 py-3">
        <p className="flex-1 text-sm">Audit the Lumina theme</p>
        <Button
          size="sm"
          disabled={!!busy}
          onClick={() =>
            run("theme", {
              source: "Lumina Eyewear",
              files: THEME_FILES.map((f) => ({ path: f.path, content: f.code })),
            })
          }
        >
          {busy === "theme" ? "Auditing" : "Run audit"}
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border border-[#e3e3e3] bg-white px-4 py-4">
        <p className="text-sm font-medium">Or paste a file</p>
        <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder="templates/index.json" />
        <Textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={8}
          placeholder="Paste the theme JSON or Liquid here"
          className="font-mono text-xs"
        />
        <Button
          size="sm"
          disabled={!!busy || !paste.trim() || !path.trim()}
          onClick={() => run("paste", { source: "Pasted file", files: [{ path, content: paste }] })}
        >
          {busy === "paste" ? "Auditing" : "Audit file"}
        </Button>
      </div>

      {error && <p className="text-xs text-[#616161]">{error}</p>}

      <div className="space-y-3">
        <p className="text-sm font-medium">Findings</p>
        {loading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e3e3e3] border-t-[#008060]" />
        ) : issues.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#e3e3e3] bg-white px-4 py-8 text-center text-sm text-[#8a8a8a]">
            Nothing audited yet.
          </p>
        ) : (
          issues.map((issue) => <ThemeIssueCard key={issue.id} issue={issue} onChange={load} />)
        )}
      </div>
    </div>
  );
}