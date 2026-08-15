import React from "react";
import { FileWarning, FileCheck2 } from "lucide-react";
import CodeBlock from "./CodeBlock";

function Panel({ tone, title, subtitle, icon: Icon, code }) {
  const red = tone === "red";
  return (
    <div
      className={`rounded-2xl border p-4 ${
        red ? "border-rose-500/25 bg-rose-500/[0.04]" : "border-emerald-500/25 bg-emerald-500/[0.04]"
      }`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${red ? "text-rose-400" : "text-emerald-400"}`} />
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider ${red ? "text-rose-300" : "text-emerald-300"}`}>
            {title}
          </p>
          <p className="truncate font-mono text-[11px] text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <CodeBlock code={code} tone={tone} />
    </div>
  );
}

export default function DiffViewer({ issue }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel tone="red" title="Broken source" subtitle={issue.file_path} icon={FileWarning} code={issue.broken_code} />
      <Panel tone="green" title="AI agent patch" subtitle={`${issue.file_path} · validated`} icon={FileCheck2} code={issue.healed_code} />
    </div>
  );
}