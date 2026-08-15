import React from "react";
import { GitCommit } from "lucide-react";
import { format } from "date-fns";

export default function PipelineFeed({ deployments }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0b0d11] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Pipeline feed</h2>
        <span className="font-mono text-[11px] text-zinc-500">urban-threads/theme</span>
      </div>
      <div className="space-y-2.5">
        {deployments.map((d) => {
          const failed = d.pipeline_status === "Failed";
          return (
            <div
              key={d.id}
              className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04] sm:flex-row sm:items-center sm:gap-4"
            >
              <GitCommit className={`w-4 h-4 shrink-0 ${failed ? "text-rose-400" : "text-emerald-400"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-200">{d.commit_message}</p>
                <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                  {d.commit_hash} · {d.branch} · {d.author}
                  {d.timestamp ? ` · ${format(new Date(d.timestamp), "MMM d, HH:mm")}` : ""}
                </p>
                {failed && d.error_summary && (
                  <p className="mt-2 rounded-lg bg-rose-500/10 px-2.5 py-1.5 font-mono text-[11px] text-rose-300">
                    🔴 {d.error_summary}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[11px] font-medium sm:self-center ${
                  failed
                    ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25"
                    : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                }`}
              >
                {failed ? "Failed" : "Passed"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}