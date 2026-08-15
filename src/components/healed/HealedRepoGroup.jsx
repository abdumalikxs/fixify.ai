import React from "react";
import { ChevronRight, GitBranch } from "lucide-react";
import HealedFixCard from "@/components/healed/HealedFixCard";

export default function HealedRepoGroup({ repo, fixes, open, onToggle }) {
  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <button onClick={onToggle} className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[#f6f8fa]">
        <ChevronRight className={`h-4 w-4 text-[#616161] transition-transform ${open ? "rotate-90" : ""}`} />
        <GitBranch className="h-4 w-4 text-[#616161]" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs">{repo}</span>
        <span className="text-[11px] text-[#8a8a8a]">
          {fixes.length} healed issue{fixes.length === 1 ? "" : "s"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-[#e3e3e3] p-3">
          {fixes.map((f, i) => (
            <HealedFixCard key={f.id} fix={f} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}