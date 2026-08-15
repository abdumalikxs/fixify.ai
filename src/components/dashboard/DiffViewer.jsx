import React from "react";
import CodeBlock from "./CodeBlock";

function Panel({ tone, title, subtitle, code }) {
  const red = tone === "red";
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${red ? "bg-[#d72c0d]" : "bg-[#008060]"}`} />
        <p className="text-xs font-medium text-[#1a1a1a]">{title}</p>
        <p className="truncate font-mono text-[11px] text-[#8a8a8a]">{subtitle}</p>
      </div>
      <CodeBlock code={code} />
    </div>
  );
}

export default function DiffViewer({ issue }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel tone="red" title="Broken source" subtitle={issue.file_path} code={issue.broken_code} />
      <Panel tone="green" title="Agent patch" subtitle="validated" code={issue.healed_code} />
    </div>
  );
}