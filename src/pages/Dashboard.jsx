import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, GitMerge, ShieldCheck, Store } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function Dashboard() {
  const [proposals, setProposals] = useState([]);
  const [repos, setRepos] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.FixProposal.list("-created_date", 100),
      base44.entities.MonitoredRepo.list("-created_date"),
      base44.entities.Shop.list("-created_date"),
    ]).then(([p, r, s]) => {
      setProposals(p);
      setRepos(r);
      setShops(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8a8a8a]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const open = proposals.filter((p) => p.status === "Proposed");
  const inFlight = proposals.filter((p) => p.status === "Approved");
  const merged = proposals.filter((p) => p.status === "Merged");
  const themeChecked = repos.filter((r) => r.theme_check_enabled);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Self-healing overview</h1>
          <p className="mt-1 text-sm text-[#616161]">
            Theme Check runs on every push to your Shopify theme repositories. When it fails, the agent reads the log,
            patches the Liquid or JSON, and opens a verified pull request.
          </p>
        </div>
        <div className="rounded-full bg-[#e5f5f0] px-3 py-1 text-xs font-medium text-[#006b55]">
          Watching {repos.filter((r) => r.enabled).length} theme{repos.filter((r) => r.enabled).length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Fixes awaiting review"
          value={open.length}
          hint={inFlight.length ? `${inFlight.length} approved PR${inFlight.length === 1 ? "" : "s"} awaiting merge` : "drafted from real CI logs"}
          Icon={AlertTriangle}
          tone={open.length ? "text-[#8a5300]" : "text-[#1a1a1a]"}
        />
        <StatCard label="Fixes merged" value={merged.length} hint="shipped to the theme" Icon={GitMerge} tone="text-[#008060]" />
        <StatCard
          label="Theme Check enabled"
          value={`${themeChecked.length}/${repos.length}`}
          hint="repositories linted in CI"
          Icon={ShieldCheck}
        />
        <StatCard label="Connected shops" value={shops.length} hint="client stores" Icon={Store} />
      </div>

      <ActivityFeed proposals={proposals.slice(0, 8)} />
    </div>
  );
}