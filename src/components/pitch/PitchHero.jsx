import React from "react";
import { Bot, ShieldCheck, Timer } from "lucide-react";

export default function PitchHero() {
  return (
    <div className="rounded-xl border border-[#30363d] bg-white p-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#e5f5f0] px-3 py-1 text-xs font-medium text-[#006b55]">
        <Bot className="h-3.5 w-3.5" /> Fixify.AI — self-healing CI/CD
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Your pipeline shouldn&apos;t just tell you it broke. It should fix itself.
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#616161]">
        Every Shopify theme team ships the same way: push a Liquid or JSON change, wait for CI, watch it go red, then dig
        through hundreds of log lines to find one unclosed tag. Fixify reads that log for you, finds the exact broken
        file, writes the patch, and opens a pull request that only merges once CI is green again.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { Icon: Timer, title: "Minutes, not hours", body: "Detection to verified pull request without a developer opening the log." },
          { Icon: ShieldCheck, title: "Never blind-pushes", body: "Every patch is a PR, gated on a real CI pass and your approval." },
          { Icon: Bot, title: "Learns the failure", body: "If the fix fails CI, the agent re-reads the new log and revises the patch." },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="rounded-lg border border-[#30363d] bg-[#f6f8fa] p-4">
            <Icon className="h-4 w-4 text-[#008060]" />
            <p className="mt-2 text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs leading-5 text-[#616161]">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}