import React from "react";
import { ChevronRight, GitBranch } from "lucide-react";
import ProposalCard from "@/components/agent/ProposalCard";

export default function RepoFixGroup({ repo, proposals, open, onToggle, onChange }) {
  const openCount = proposals.filter((p) => p.status === "Proposed").length;

  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#f6f8fa]"
      >
        <ChevronRight className={`h-4 w-4 text-[#616161] transition-transform ${open ? "rotate-90" : ""}`} />
        <GitBranch className="h-4 w-4 text-[#616161]" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs">{repo}</span>
        <span className="text-[11px] text-[#8a8a8a]">
          {proposals.length} fix{proposals.length === 1 ? "" : "es"}
          {openCount > 0 && ` · ${openCount} awaiting review`}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-[#e3e3e3] p-3">
          {proposals.map((p, i) => (
            <ProposalCard key={p.id} proposal={p} onChange={onChange} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}