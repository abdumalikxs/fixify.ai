import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import HealedRepoGroup from "@/components/healed/HealedRepoGroup";

export default function HealedIssues() {
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRepo, setOpenRepo] = useState("");

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

  const grouped = Object.entries(
    fixes.reduce((acc, f) => {
      (acc[f.repo_full_name] = acc[f.repo_full_name] || []).push(f);
      return acc;
    }, {})
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Healed theme issues</h1>
        <p className="mt-1 text-sm text-[#616161]">
          Every fix the agent shipped, grouped by repository: the failing theme file, the patch, and the pull request it
          was merged in.
        </p>
      </div>

      {fixes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#e3e3e3] bg-white px-4 py-10 text-center text-sm text-[#8a8a8a]">
          No fixes merged yet. Approve and merge a fix in Autopilot and it will appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map(([repo, list]) => (
            <HealedRepoGroup
              key={repo}
              repo={repo}
              fixes={list}
              open={openRepo === repo}
              onToggle={() => setOpenRepo(openRepo === repo ? "" : repo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}