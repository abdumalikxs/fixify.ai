import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, X } from "lucide-react";
import DiffViewer from "@/components/dashboard/DiffViewer";

const STATUS_TONE = {
  Proposed: "bg-[#fff1e3] text-[#8a5300]",
  Approved: "bg-[#e6f4ec] text-[#008060]",
  Dismissed: "bg-[#f1f1f1] text-[#616161]",
  "Diagnosis only": "bg-[#f1f1f1] text-[#616161]",
};

export default function ProposalCard({ proposal, onChange }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const approve = async () => {
    setBusy("approve");
    setError("");
    try {
      await base44.functions.invoke("approveFix", { proposal_id: proposal.id });
      onChange();
    } catch (e) {
      setError(e?.response?.data?.error || "Could not open the pull request.");
    }
    setBusy("");
  };

  const dismiss = async () => {
    setBusy("dismiss");
    await base44.entities.FixProposal.update(proposal.id, { status: "Dismissed" });
    onChange();
    setBusy("");
  };

  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <div className="flex flex-wrap items-start gap-3 border-b border-[#e3e3e3] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{proposal.error_type || "CI failure"}</p>
            <span className={`rounded px-1.5 py-0.5 text-[11px] ${STATUS_TONE[proposal.status] || ""}`}>
              {proposal.status}
            </span>
            {proposal.confidence && (
              <span className="text-[11px] text-[#8a8a8a]">{proposal.confidence} confidence</span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#616161]">{proposal.failure_summary}</p>
          <p className="mt-1 font-mono text-[11px] text-[#8a8a8a]">
            {proposal.repo_full_name} · {proposal.branch} · {proposal.commit_sha} · {proposal.workflow_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {proposal.run_url && (
            <a
              href={proposal.pr_url || proposal.run_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-[#616161] hover:text-[#1a1a1a]"
            >
              {proposal.pr_url ? "View PR" : "View run"} <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {proposal.status === "Proposed" && (
            <>
              <Button size="sm" variant="ghost" onClick={dismiss} disabled={!!busy}>
                <X className="mr-1 h-3.5 w-3.5" /> Dismiss
              </Button>
              <Button size="sm" onClick={approve} disabled={!!busy}>
                <Check className="mr-1 h-3.5 w-3.5" />
                {busy === "approve" ? "Opening PR" : "Approve & open PR"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {error && <p className="mb-3 text-xs text-[#d72c0d]">{error}</p>}
        {proposal.explanation && (
          <p className="mb-4 rounded-lg bg-[#fafafa] px-3 py-2 text-xs text-[#303030]">{proposal.explanation}</p>
        )}
        {proposal.proposed_code ? (
          <DiffViewer
            issue={{
              file_path: proposal.file_path,
              broken_code: proposal.broken_code,
              healed_code: proposal.proposed_code,
            }}
          />
        ) : (
          <pre className="max-h-56 overflow-auto rounded-lg border border-[#e3e3e3] bg-[#fafafa] p-3 font-mono text-[11.5px] text-[#303030]">
            {proposal.log_excerpt}
          </pre>
        )}
      </div>
    </div>
  );
}