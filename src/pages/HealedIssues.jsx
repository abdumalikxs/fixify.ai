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
      <div className="flex h-40 items-center justify-center text-[#8a8a8a]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Healed issues</h1>
        <p className="mt-1 text-sm text-[#616161]">Detected theme defects and their agent patches.</p>
      </div>
      {issues.length === 0 && <p className="text-sm text-[#616161]">No issues detected yet.</p>}
      {issues.map((issue) => (
        <div key={issue.id} className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck
                className={`w-4 h-4 ${issue.resolution_status === "Unresolved" ? "text-[#b3260c]" : "text-[#008060]"}`}
              />
              <div>
                <p className="text-sm text-[#1a1a1a]">{issue.error_type}</p>
                <p className="mt-0.5 font-mono text-[11px] text-[#8a8a8a]">{issue.file_path}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                issue.resolution_status === "Unresolved"
                  ? "bg-[#fdeeeb] text-[#b3260c]"
                  : "bg-[#e5f5f0] text-[#006b55]"
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