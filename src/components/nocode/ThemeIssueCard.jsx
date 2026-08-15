import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check } from "lucide-react";
import DiffViewer from "@/components/dashboard/DiffViewer";

export default function ThemeIssueCard({ issue, onChange }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    setBusy(true);
    await base44.entities.ThemeIssue.update(issue.id, {
      status: "Healed",
      healed_at: new Date().toISOString(),
    });
    await onChange();
    setBusy(false);
  };

  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button onClick={() => setOpen(!open)} className="shrink-0">
          <ChevronRight className={`h-4 w-4 text-[#616161] transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpen(!open)}>
          <p className="truncate font-mono text-xs text-[#1a1a1a]">{issue.file_path}</p>
          <p className="mt-0.5 truncate text-xs text-[#616161]">
            {issue.issue_type} — {issue.summary}
          </p>
        </div>
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] ${
            issue.status === "Healed" ? "bg-[#e6f4ec] text-[#008060]" : "bg-[#fff1e3] text-[#8a5300]"
          }`}
        >
          {issue.status}
        </span>
        {issue.status === "Detected" && issue.fixed_code && (
          <Button size="sm" onClick={apply} disabled={busy}>
            <Check className="mr-1 h-3.5 w-3.5" />
            {busy ? "Applying" : "Apply fix"}
          </Button>
        )}
      </div>

      {open && (
        <div className="border-t border-[#e3e3e3] px-4 py-4">
          {issue.explanation && (
            <p className="mb-4 rounded-lg bg-[#fafafa] px-3 py-2 text-xs text-[#303030]">{issue.explanation}</p>
          )}
          <DiffViewer
            issue={{
              file_path: issue.file_path,
              broken_code: issue.broken_code,
              healed_code: issue.fixed_code,
            }}
          />
        </div>
      )}
    </div>
  );
}