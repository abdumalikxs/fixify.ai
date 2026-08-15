import React from "react";
import { Store, Code2 } from "lucide-react";

const AUDIENCES = [
  {
    Icon: Store,
    title: "For Shopify merchants and agencies",
    points: [
      "A broken theme is lost revenue — every minute the storefront preview is red is a minute of a stalled launch.",
      "Most theme breakages are syntax-level: unclosed Liquid blocks, bad JSON in section schemas, renamed snippets. Exactly the class of error an agent fixes reliably.",
      "Non-technical staff edit themes. Fixify gives them a safety net instead of a Slack message to a developer.",
      "Agencies run dozens of client themes from one dashboard, so one on-call engineer covers all of them.",
    ],
  },
  {
    Icon: Code2,
    title: "For any team with a CI/CD pipeline",
    points: [
      "The pattern is not Shopify-specific: a failing job, a log, a file, a patch, a verified pull request.",
      "It removes the worst part of CI — context-switching to read someone else's stack trace — while keeping review in human hands.",
      "Nothing merges without a green pipeline, so the blast radius of a wrong guess is a closed pull request.",
      "The retry loop means transient and cascading failures get a second, better-informed attempt automatically.",
    ],
  },
];

export default function WhyItMatters() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {AUDIENCES.map(({ Icon, title, points }) => (
        <div key={title} className="rounded-xl border border-[#30363d] bg-white p-6">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#008060]" />
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          </div>
          <ul className="mt-3 space-y-2">
            {points.map((p) => (
              <li key={p} className="flex gap-2 text-xs leading-5 text-[#616161]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#008060]" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}