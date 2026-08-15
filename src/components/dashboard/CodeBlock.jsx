import React from "react";

export default function CodeBlock({ code = "", tone = "red" }) {
  const lines = String(code).split("\n");
  const lineTone = tone === "red" ? "text-rose-200/90" : "text-emerald-100/90";
  return (
    <div className="max-h-[420px] overflow-auto rounded-xl bg-[#05060a] p-4">
      <pre className="font-mono text-[12.5px] leading-6">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4 whitespace-pre">
            <span className="w-6 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
            <span className={lineTone}>{line || " "}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}