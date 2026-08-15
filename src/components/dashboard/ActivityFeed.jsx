import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

const TONE = {
  Proposed: "bg-[#fff1e3] text-[#8a5300]",
  Approved: "bg-[#e6f4ec] text-[#008060]",
  Merged: "bg-[#e6f4ec] text-[#008060]",
  Dismissed: "bg-[#f1f1f1] text-[#616161]",
  "Diagnosis only": "bg-[#f1f1f1] text-[#616161]",
};

export default function ActivityFeed({ proposals }) {
  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white">
      <div className="flex items-center justify-between border-b border-[#e3e3e3] px-4 py-3">
        <p className="text-sm font-medium">Recent agent activity</p>
        <Link to="/autopilot" className="text-xs text-[#616161] hover:text-[#008060]">
          Open autopilot
        </Link>
      </div>

      {proposals.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-[#8a8a8a]">
          Nothing yet — add a theme repository in Autopilot and the agent will start watching its checks.
        </p>
      ) : (
        <div className="divide-y divide-[#f1f1f1]">
          {proposals.map((p) => (
            <div key={p.id} className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm">{p.error_type || "CI failure"}</p>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] ${TONE[p.status] || ""}`}>{p.status}</span>
                </div>
                <p className="mt-0.5 truncate font-mono text-[11px] text-[#8a8a8a]">
                  {p.repo_full_name}
                  {p.file_path ? ` · ${p.file_path}` : ""}
                  {p.created_date ? ` · ${format(new Date(p.created_date), "MMM d, HH:mm")}` : ""}
                </p>
              </div>
              {(p.pr_url || p.run_url) && (
                <a
                  href={p.pr_url || p.run_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 text-xs text-[#616161] hover:text-[#1a1a1a]"
                >
                  {p.pr_url ? "PR" : "Run"} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}