import React, { useState } from "react";
import { ChevronRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import DiffViewer from "@/components/dashboard/DiffViewer";

export default function HealedFixCard({ fix, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#f6f8fa]"
      >
        <ChevronRight className={`h-4 w-4 shrink-0 text-[#616161] transition-transform ${open ? "rotate-90" : ""}`} />
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#008060]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{fix.error_type || "CI failure"}</span>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-[#8a8a8a]">{fix.file_path}</span>
        </span>
        <span className="shrink-0 text-[11px] text-[#8a8a8a]">
          {fix.merged_at ? `merged ${format(new Date(fix.merged_at), "MMM d, HH:mm")}` : "merged"}
        </span>
      </button>

      {open && (
        <div className="border-t border-[#e3e3e3] px-4 py-4">
          {fix.explanation && (
            <p className="mb-4 rounded-lg bg-[#fafafa] px-3 py-2 text-xs text-[#303030]">{fix.explanation}</p>
          )}
          <DiffViewer
            issue={{ file_path: fix.file_path, broken_code: fix.broken_code, healed_code: fix.proposed_code }}
          />
          {fix.pr_url && (
            <a
              href={fix.pr_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#616161] hover:text-[#1a1a1a]"
            >
              View pull request <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}