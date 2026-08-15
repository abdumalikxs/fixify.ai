import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import ThemeCheckButton from "@/components/agent/ThemeCheckButton";

export default function RepoMonitor({ monitored, onChange, onScan, scanning }) {
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.functions
      .invoke("listGithubRepos", {})
      .then((r) => setRepos(r.data.repos || []))
      .catch((e) => setError(e?.response?.data?.error || "Could not load repositories."));
  }, []);

  const addRepo = async (repo) => {
    await base44.entities.MonitoredRepo.create({
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      enabled: true,
    });
    onChange();
  };

  const toggle = async (rec, enabled) => {
    await base44.entities.MonitoredRepo.update(rec.id, { enabled });
    onChange();
  };

  const watched = new Set(monitored.map((m) => m.full_name));

  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <div className="flex items-center justify-between border-b border-[#e3e3e3] px-4 py-3">
        <div>
          <p className="text-sm font-medium">Monitored theme repositories</p>
          <p className="text-xs text-[#616161]">
            The agent checks failed Theme Check &amp; CI runs every 5 minutes.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onScan} disabled={scanning}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning" : "Scan now"}
        </Button>
      </div>

      {error && <p className="px-4 py-3 text-xs text-[#d72c0d]">{error}</p>}

      <div className="max-h-72 divide-y divide-[#f1f1f1] overflow-auto">
        {monitored.map((rec) => (
          <div key={rec.id} className="flex items-center justify-between px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate font-mono text-xs">{rec.full_name}</p>
              <p className="text-[11px] text-[#8a8a8a]">
                {rec.last_scanned_at ? `last checked ${new Date(rec.last_scanned_at).toLocaleString()}` : "not checked yet"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <ThemeCheckButton repo={rec} onChange={onChange} />
              <Switch checked={!!rec.enabled} onCheckedChange={(v) => toggle(rec, v)} />
            </div>
          </div>
        ))}

        {repos
          .filter((r) => !watched.has(r.full_name))
          .slice(0, 40)
          .map((r) => (
            <div key={r.full_name} className="flex items-center justify-between px-4 py-2.5">
              <p className="truncate font-mono text-xs text-[#616161]">{r.full_name}</p>
              <Button size="sm" variant="ghost" onClick={() => addRepo(r)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Monitor
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}