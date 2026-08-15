import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GitMerge, Loader2, RefreshCw, XCircle } from "lucide-react";

const TONE = {
  passing: { label: "All checks passed", cls: "text-[#008060]", Icon: CheckCircle2 },
  failing: { label: "Checks failing", cls: "text-[#d72c0d]", Icon: XCircle },
  pending: { label: "Checks running", cls: "text-[#8a5300]", Icon: Loader2 },
  no_checks: { label: "No checks reported yet", cls: "text-[#8a8a8a]", Icon: RefreshCw },
};

export default function PrChecks({ proposal, onChange }) {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("prStatus", { proposal_id: proposal.id });
      setStatus(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || "Could not read the pull request status.");
    }
  }, [proposal.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const merge = async () => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("mergeFix", { proposal_id: proposal.id });
      onChange();
    } catch (e) {
      setError(e?.response?.data?.error || "Could not merge the pull request.");
    }
    setBusy(false);
  };

  if (!status) {
    return <p className="border-b border-[#e3e3e3] px-4 py-2 text-xs text-[#8a8a8a]">Checking pull request…</p>;
  }

  const tone = TONE[status.state] || TONE.no_checks;
  const { Icon } = tone;

  return (
    <div className="border-b border-[#e3e3e3] bg-[#fafafa] px-4 py-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${tone.cls}`}>
          <Icon className={`h-3.5 w-3.5 ${status.state === "pending" ? "animate-spin" : ""}`} />
          {status.merged ? "Merged into " + proposal.branch : tone.label}
        </span>
        {status.checks.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-[#616161] hover:text-[#1a1a1a]"
          >
            {c.name}: {c.conclusion || c.status}
          </a>
        ))}
        {!status.merged && !status.closed && (
          <Button
            size="sm"
            className="ml-auto"
            onClick={merge}
            disabled={busy || status.state === "pending" || status.state === "failing"}
          >
            <GitMerge className="mr-1 h-3.5 w-3.5" />
            {busy ? "Merging" : "Merge fix"}
          </Button>
        )}
      </div>
      {error && <p className="mt-1.5 text-[11px] text-[#d72c0d]">{error}</p>}
    </div>
  );
}