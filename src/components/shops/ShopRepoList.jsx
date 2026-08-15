import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Lock, Globe, History } from "lucide-react";

export default function ShopRepoList({ shopId, linked, onChange, selected, onSelect }) {
  const [available, setAvailable] = useState([]);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    base44.functions
      .invoke("listGithubRepos", {})
      .then((r) => setAvailable(r.data.repos || []))
      .catch((e) => setError(e?.response?.data?.error || "Could not load repositories."));
  }, []);

  const link = async (repo) => {
    const existing = await base44.entities.MonitoredRepo.filter({ full_name: repo.full_name });
    if (existing.length) {
      await base44.entities.MonitoredRepo.update(existing[0].id, { shop_id: shopId });
    } else {
      await base44.entities.MonitoredRepo.create({
        full_name: repo.full_name,
        default_branch: repo.default_branch,
        enabled: true,
        shop_id: shopId,
      });
    }
    setPicking(false);
    onChange();
  };

  const unlink = async (rec) => {
    await base44.entities.MonitoredRepo.update(rec.id, { shop_id: "" });
    onChange();
  };

  const linkedNames = new Set(linked.map((r) => r.full_name));

  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <div className="flex items-center justify-between border-b border-[#e3e3e3] px-4 py-3">
        <p className="text-sm font-medium">Repositories</p>
        <Button size="sm" variant="outline" onClick={() => setPicking(!picking)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Link repository
        </Button>
      </div>

      {error && <p className="px-4 py-3 text-xs text-[#d72c0d]">{error}</p>}

      <div className="divide-y divide-[#f1f1f1]">
        {linked.map((rec) => (
          <div
            key={rec.id}
            className={`flex items-center gap-3 px-4 py-3 ${selected?.id === rec.id ? "bg-[#f6f6f7]" : ""}`}
          >
            <button className="min-w-0 flex-1 text-left" onClick={() => onSelect(rec)}>
              <p className="truncate font-mono text-xs">{rec.full_name}</p>
              <p className="mt-0.5 text-[11px] text-[#8a8a8a]">
                {rec.default_branch} ·{" "}
                {rec.last_scanned_at ? `scanned ${new Date(rec.last_scanned_at).toLocaleString()}` : "not scanned yet"}
              </p>
            </button>
            <Button size="sm" variant="ghost" onClick={() => onSelect(rec)}>
              <History className="mr-1 h-3.5 w-3.5" /> Commits
            </Button>
            <button className="text-[11px] text-[#616161] hover:text-[#d72c0d]" onClick={() => unlink(rec)}>
              Unlink
            </button>
          </div>
        ))}
        {linked.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-[#8a8a8a]">No repositories linked to this shop yet.</p>
        )}
      </div>

      {picking && (
        <div className="max-h-64 divide-y divide-[#f1f1f1] overflow-auto border-t border-[#e3e3e3] bg-[#fafafa]">
          {available
            .filter((r) => !linkedNames.has(r.full_name))
            .map((r) => (
              <div key={r.full_name} className="flex items-center justify-between px-4 py-2.5">
                <p className="flex items-center gap-2 truncate font-mono text-xs text-[#616161]">
                  {r.private ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                  {r.full_name}
                </p>
                <Button size="sm" variant="ghost" onClick={() => link(r)}>Link</Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}