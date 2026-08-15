import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import RepoMonitor from "@/components/agent/RepoMonitor";
import RepoFixGroup from "@/components/agent/RepoFixGroup";

export default function Autopilot() {
  const [monitored, setMonitored] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [openRepo, setOpenRepo] = useState("");

  const load = useCallback(async () => {
    const [repos, props] = await Promise.all([
      base44.entities.MonitoredRepo.list("-created_date"),
      base44.entities.FixProposal.list("-created_date", 30),
    ]);
    setMonitored(repos);
    setProposals(props);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const scan = async () => {
    setScanning(true);
    setScanError("");
    try {
      await base44.functions.invoke("scanPipelines", {});
      await load();
    } catch (e) {
      setScanError(e?.response?.data?.error || "The scan failed.");
    }
    setScanning(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Theme deploy autopilot</h1>
        <p className="mt-1 text-sm text-[#616161]">
          Add Shopify Theme Check to a theme repository, and the agent watches its runs — reading the real job logs,
          locating the broken Liquid or JSON, and drafting a patch. Nothing is pushed until you approve it.
        </p>
      </div>

      <RepoMonitor monitored={monitored} onChange={load} onScan={scan} scanning={scanning} />
      {scanError && <p className="text-xs text-[#d72c0d]">{scanError}</p>}

      <div className="space-y-4">
        <p className="text-sm font-medium">Fix queue</p>
        {loading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e3e3e3] border-t-[#008060]" />
        ) : proposals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#e3e3e3] bg-white px-4 py-8 text-center text-sm text-[#8a8a8a]">
            No failures analysed yet. Monitor a theme repository, add Theme Check, then run a scan.
          </p>
        ) : (
          Object.entries(
            proposals.reduce((acc, p) => {
              (acc[p.repo_full_name] = acc[p.repo_full_name] || []).push(p);
              return acc;
            }, {})
          ).map(([repo, list]) => (
            <RepoFixGroup
              key={repo}
              repo={repo}
              proposals={list}
              open={openRepo === repo}
              onToggle={() => setOpenRepo(openRepo === repo ? "" : repo)}
              onChange={load}
            />
          ))
        )}
      </div>
    </div>
  );
}