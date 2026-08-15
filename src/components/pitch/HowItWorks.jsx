import React from "react";

const STEPS = [
  { n: "1", title: "Watch", body: "Fixify commits Shopify Theme Check into your repo and polls its workflow runs every few minutes." },
  { n: "2", title: "Diagnose", body: "On a red run it downloads the real job log, identifies the error class, and fetches the failing file at that exact commit." },
  { n: "3", title: "Patch", body: "The agent writes a minimal, targeted change — no reformatting, no rewrites — with a plain-English explanation and a confidence level." },
  { n: "4", title: "Prove", body: "The patch lands on a Fixify branch as a pull request. CI runs again on the fix, so the proof is a green check, not a promise." },
  { n: "5", title: "Merge or retry", body: "You approve and merge in one click. If CI is still red, the agent reads the new log and revises the patch." },
];

export default function HowItWorks() {
  return (
    <div className="rounded-xl border border-[#30363d] bg-white p-6">
      <h2 className="text-lg font-semibold tracking-tight">The loop</h2>
      <p className="mt-1 text-sm text-[#616161]">Five steps, and a human only touches the last one.</p>
      <div className="mt-5 space-y-3">
        {STEPS.map(({ n, title, body }) => (
          <div key={n} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f6f8fa] font-mono text-xs text-[#1f2328]">
              {n}
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-0.5 text-xs leading-5 text-[#616161]">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}