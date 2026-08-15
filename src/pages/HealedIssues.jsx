import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldCheck } from "lucide-react";
import DiffViewer from "@/components/dashboard/DiffViewer";

export default function HealedIssues() {
  const [issues, setIssues] = useState(null);

  useEffect(() => {
    base44.entities.ShopifyError.list("-updated_date", 50).then(setIssues);
  }, []);

  if (!issues) {
    return (
      <div className="flex h-40 items-center justify-center text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Healed issues</h1>
        <p className="mt-1 text-sm text-zinc-500">Detected theme defects and their agent patches.</p>
      </div>
      {issues.length === 0 && <p className="text-sm text-zinc-500">No issues detected yet.</p>}
      {issues.map((issue) => (
        <div key={issue.id} className="space-y-4 rounded-2xl border border-white/[0.07] bg-[#0b0d11] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck
                className={`w-4 h-4 ${issue.resolution_status === "Unresolved" ? "text-rose-400" : "text-emerald-400"}`}
              />
              <div>
                <p className="text-sm text-zinc-200">{issue.error_type}</p>
                <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{issue.file_path}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ${
                issue.resolution_status === "Unresolved"
                  ? "bg-rose-500/12 text-rose-300 ring-rose-500/25"
                  : "bg-emerald-500/12 text-emerald-300 ring-emerald-500/25"
              }`}
            >
              {issue.resolution_status}
            </span>
          </div>
          <DiffViewer issue={issue} />
        </div>
      ))}
    </div>
  );
}