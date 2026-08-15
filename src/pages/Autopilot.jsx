import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import RepoMonitor from "@/components/agent/RepoMonitor";
import ProposalCard from "@/components/agent/ProposalCard";

export default function Autopilot() {
  const [monitored, setMonitored] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");

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
        <h1 className="text-xl font-semibold tracking-tight">CI/CD Autopilot</h1>
        <p className="mt-1 text-sm text-[#616161]">
          The agent watches your GitHub Actions runs, diagnoses failures from the real job logs, and drafts a patch. Nothing
          is pushed until you approve it.
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
            No failures analysed yet. Monitor a repository, then run a scan.
          </p>
        ) : (
          proposals.map((p) => <ProposalCard key={p.id} proposal={p} onChange={load} />)
        )}
      </div>
    </div>
  );
}