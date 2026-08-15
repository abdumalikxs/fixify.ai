import React from "react";
import { format } from "date-fns";

export default function PipelineFeed({ deployments }) {
  return (
    <div className="rounded-xl border border-[#e3e3e3] bg-white">
      <div className="flex items-center justify-between border-b border-[#e3e3e3] px-5 py-3.5">
        <h2 className="text-sm font-medium">Pipeline feed</h2>
        <span className="font-mono text-[11px] text-[#8a8a8a]">urban-threads/theme</span>
      </div>
      <div className="divide-y divide-[#f1f1f1]">
        {deployments.map((d) => {
          const failed = d.pipeline_status === "Failed";
          return (
            <div key={d.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[#1a1a1a]">{d.commit_message}</p>
                <p className="mt-0.5 font-mono text-[11px] text-[#8a8a8a]">
                  {d.commit_hash} · {d.branch} · {d.author}
                  {d.timestamp ? ` · ${format(new Date(d.timestamp), "MMM d, HH:mm")}` : ""}
                </p>
                {failed && d.error_summary && (
                  <p className="mt-2 font-mono text-[11px] text-[#b3260c]">{d.error_summary}</p>
                )}
              </div>
              <span
                className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:self-center ${
                  failed ? "bg-[#fdeeeb] text-[#b3260c]" : "bg-[#e5f5f0] text-[#006b55]"
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