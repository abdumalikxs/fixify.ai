import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PipelineFeed from "@/components/dashboard/PipelineFeed";
import DiffViewer from "@/components/dashboard/DiffViewer";
import HealerProgress from "@/components/dashboard/HealerProgress";

const STEPS = [
  "Analyzing CI/CD build error logs...",
  "Agent parsing Shopify Liquid/JSON AST...",
  "Generating and validating syntax patch...",
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Dashboard() {
  const [deployments, setDeployments] = useState([]);
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(-1);

  const load = async () => {
    const [deps, errors] = await Promise.all([
      base44.entities.Deployment.list("-timestamp", 20),
      base44.entities.ShopifyError.list("-created_date", 10),
    ]);
    setDeployments(deps);
    setIssue(errors.find((e) => e.resolution_status === "Unresolved") || errors[0] || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const healed = issue?.resolution_status === "Auto-Healed & Deployed";
  const running = step >= 0;

  const runHealer = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await wait(1300);
    }
    await base44.entities.ShopifyError.update(issue.id, { resolution_status: "Auto-Healed & Deployed" });
    await base44.entities.Deployment.create({
      repo_name: issue ? "urban-threads/theme" : "urban-threads/theme",
      commit_hash: Math.random().toString(16).slice(2, 9),
      branch: "main",
      pipeline_status: "Passed",
      commit_message: `fix(${issue.file_path}): auto-healed ${issue.error_type} via Fixify agent`,
      author: "fixify-agent",
      error_summary: "",
      timestamp: new Date().toISOString(),
    });
    setStep(-1);
    await load();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8a8a8a]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Self-healing overview</h1>
          <p className="mt-1 text-sm text-[#616161]">Agentic monitoring for Shopify theme infrastructure & CI/CD.</p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            healed ? "bg-[#e5f5f0] text-[#006b55]" : "bg-[#fdeeeb] text-[#b3260c]"
          }`}
        >
          {healed
            ? "Pipeline passed & live store synced via Shopify API"
            : "CI/CD pipeline build failed: syntax error in Shopify theme JSON"}
        </div>
      </div>

      <PipelineFeed deployments={deployments} />

      {issue && (
        <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">{issue.error_type}</h2>
              <p className="mt-0.5 font-mono text-[11px] text-[#8a8a8a]">
                {issue.store_name} · {issue.file_path}
              </p>
            </div>
            <span className="rounded-full bg-[#f1f1f1] px-2.5 py-0.5 font-mono text-[11px] text-[#616161]">
              {issue.resolution_status}
            </span>
          </div>

          <AnimatePresence>{running && <HealerProgress steps={STEPS} activeIndex={step} />}</AnimatePresence>

          <DiffViewer issue={issue} />

          <div className="flex justify-end">
            {healed ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#006b55]">
                Patch pushed to main and synced to the live storefront.
              </motion.p>
            ) : (
              <Button
                onClick={runHealer}
                disabled={running}
                className="rounded-lg bg-[#1a1a1a] text-white hover:bg-[#303030]"
              >
                {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run agentic self-healer & push fix
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}