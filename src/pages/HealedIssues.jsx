import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import DiffViewer from "@/components/dashboard/DiffViewer";

export default function HealedIssues() {
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.FixProposal.filter({ status: "Merged" }, "-created_date", 50).then((f) => {
      setFixes(f);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8a8a8a]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Healed theme issues</h1>
        <p className="mt-1 text-sm text-[#616161]">
          Every fix the agent shipped: the failing theme file, the patch, and the pull request it was merged in.
        </p>
      </div>

      {fixes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#e3e3e3] bg-white px-4 py-10 text-center text-sm text-[#8a8a8a]">
          No fixes merged yet. Approve and merge a fix in Autopilot and it will appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {fixes.map((f) => (
            <div key={f.id} className="rounded-lg border border-[#e3e3e3] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3e3e3] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.error_type || "CI failure"}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-[#8a8a8a]">
                    {f.repo_full_name} · {f.file_path}
                    {f.merged_at ? ` · merged ${format(new Date(f.merged_at), "MMM d, HH:mm")}` : ""}
                  </p>
                </div>
                {f.pr_url && (
                  <a
                    href={f.pr_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-[#616161] hover:text-[#1a1a1a]"
                  >
                    View PR <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="px-4 py-4">
                {f.explanation && (
                  <p className="mb-4 rounded-lg bg-[#fafafa] px-3 py-2 text-xs text-[#303030]">{f.explanation}</p>
                )}
                <DiffViewer
                  issue={{ file_path: f.file_path, broken_code: f.broken_code, healed_code: f.proposed_code }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}