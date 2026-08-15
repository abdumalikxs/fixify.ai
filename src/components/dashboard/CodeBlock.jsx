import React from "react";

export default function CodeBlock({ code = "" }) {
  const lines = String(code).split("\n");
  return (
    <div className="max-h-[420px] overflow-auto rounded-lg border border-[#e3e3e3] bg-[#fafafa] p-4">
      <pre className="font-mono text-[12.5px] leading-6">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4 whitespace-pre">
            <span className="w-6 shrink-0 select-none text-right text-[#b5b5b5]">{i + 1}</span>
            <span className="text-[#303030]">{line || " "}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}