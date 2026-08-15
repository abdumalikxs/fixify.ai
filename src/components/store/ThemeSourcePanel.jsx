import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileCode2, AlertTriangle, Github } from "lucide-react";
import { THEME_FILES, THEME_REPO } from "@/data/luminaTheme";

export default function ThemeSourcePanel() {
  const [active, setActive] = useState(THEME_FILES[0].path);
  const file = THEME_FILES.find((f) => f.path === active);

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#ffffff]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#e5e7eb] px-5 py-3.5">
        <Github className="h-4 w-4 text-[#111827]" />
        <p className="font-mono text-xs text-[#111827]">{THEME_REPO}</p>
        <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-medium text-[#b42318]">
          Theme Check failing · 2 errors
        </span>
        <Link to="/autopilot" className="ml-auto text-xs text-[#4b5563] underline underline-offset-4">
          Heal in Autopilot
        </Link>
      </div>

      <div className="grid md:grid-cols-[240px_1fr]">
        <div className="border-b border-[#e5e7eb] md:border-b-0 md:border-r">
          {THEME_FILES.map((f) => (
            <button
              key={f.path}
              onClick={() => setActive(f.path)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left font-mono text-[11px] ${
                active === f.path ? "bg-[#f9fafb] text-[#111827]" : "text-[#4b5563] hover:bg-[#f9fafb]"
              }`}
            >
              {f.broken ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#b42318]" />
              ) : (
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-[#9ca3af]" />
              )}
              <span className="truncate">{f.path}</span>
            </button>
          ))}
        </div>

        <div>
          {file.broken && (
            <p className="border-b border-[#fee2e2] bg-[#fef2f2] px-4 py-2 font-mono text-[11px] text-[#b42318]">
              {file.error}
            </p>
          )}
          <pre className="max-h-80 overflow-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-[#374151]">
            {file.code}
          </pre>
        </div>
      </div>
    </div>
  );
}