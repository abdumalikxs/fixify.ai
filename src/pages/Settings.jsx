import React from "react";
import { Switch } from "@/components/ui/switch";

const options = [
  { label: "Auto-heal on pipeline failure", desc: "Run the agent automatically when a build fails.", on: true },
  { label: "Push fixes directly to main", desc: "Skip pull request review for syntax-only patches.", on: false },
  { label: "Sync healed theme via Shopify API", desc: "Publish the patched theme to the live store.", on: true },
];

export default function Settings() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Agent behaviour for this workspace.</p>
      </div>
      <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-[#0b0d11]">
        {options.map((o) => (
          <div key={o.label} className="flex items-center gap-6 p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-200">{o.label}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{o.desc}</p>
            </div>
            <Switch defaultChecked={o.on} />
          </div>
        ))}
      </div>
    </div>
  );
}