import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Check } from "lucide-react";
import DiffViewer from "@/components/dashboard/DiffViewer";

const CASE = {
  file_path: "layout/theme.liquid",
  broken_code: `{% if section.settings.show_banner %}
  <div class="announcement">
    {{ section.settings.banner_text }}
  </div>
<!-- endif missing -->
<main role="main">{{ content_for_layout }}</main>`,
  healed_code: `{% if section.settings.show_banner %}
  <div class="announcement">
    {{ section.settings.banner_text }}
  </div>
{% endif %}
<main role="main">{{ content_for_layout }}</main>`,
};

export default function LuminaCase() {
  return (
    <div className="space-y-4 rounded-xl border border-[#30363d] bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">Case study</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Lumina Eyewear — a storefront that would not build</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#ffb3ab] bg-[#fff4f4] p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[#d72c0d]">
            <AlertTriangle className="h-4 w-4" /> The problem
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#616161]">
            <li>A merchandiser edits the announcement bar and drops the closing <code className="font-mono">{"{% endif %}"}</code>.</li>
            <li>A second commit leaves a trailing comma in <code className="font-mono">sections/header.json</code>.</li>
            <li>Theme Check fails. The storefront preview is dead and the campaign launch is blocked.</li>
            <li>The only developer who reads Liquid is offline. The log is 400 lines long.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-[#30363d] bg-[#e5f5f0] p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[#008060]">
            <Check className="h-4 w-4" /> What Fixify did
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[#616161]">
            <li>Polled the run, pulled the failing job log, and parsed the Theme Check error.</li>
            <li>Fetched <code className="font-mono">layout/theme.liquid</code> from the commit and located the unbalanced block.</li>
            <li>Drafted the one-line patch below and opened a pull request on a Fixify branch.</li>
            <li>Waited for Theme Check to pass on the PR, then merged on approval.</li>
          </ul>
        </div>
      </div>

      <div>
        <p className="mb-2 font-mono text-xs text-[#616161]">{CASE.file_path}</p>
        <DiffViewer issue={CASE} />
      </div>

      <p className="text-xs text-[#616161]">
        You can run this exact case yourself — the broken Lumina files ship with the app.{" "}
        <Link to="/theme-audit" className="font-medium text-[#008060] hover:underline">
          Open Theme audit
        </Link>{" "}
        for the no-code path, or{" "}
        <Link to="/autopilot" className="font-medium text-[#008060] hover:underline">
          Autopilot
        </Link>{" "}
        for the full CI run.
      </p>
    </div>
  );
}