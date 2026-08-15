import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ShopRepoList from "@/components/shops/ShopRepoList";
import CommitHistory from "@/components/shops/CommitHistory";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [s, all] = await Promise.all([
      base44.entities.Shop.get(id),
      base44.entities.MonitoredRepo.filter({ shop_id: id }),
    ]);
    setShop(s);
    setRepos(all);
    setSelected((prev) => all.find((r) => r.id === prev?.id) || all[0] || null);
    if (all.length) {
      const list = await base44.entities.FixProposal.list("-created_date", 100);
      const names = new Set(all.map((r) => r.full_name));
      setProposals(list.filter((p) => names.has(p.repo_full_name)));
    } else {
      setProposals([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const toggleStatus = async () => {
    await base44.entities.Shop.update(shop.id, { status: shop.status === "Paused" ? "Active" : "Paused" });
    load();
  };

  if (loading) return <p className="text-sm text-[#8a8a8a]">Loading shop…</p>;
  if (!shop) return <p className="text-sm text-[#8a8a8a]">Shop not found.</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link to="/shops" className="inline-flex items-center gap-1.5 text-xs text-[#616161] hover:text-[#1a1a1a]">
        <ArrowLeft className="h-3.5 w-3.5" /> Connected shops
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-[#e3e3e3] bg-white p-5">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{shop.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#616161]">
            {shop.domain ? (
              <a
                href={`https://${shop.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-[#008060]"
              >
                {shop.domain} <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              "No domain set"
            )}
          </p>
          {shop.contact_email && <p className="mt-0.5 text-xs text-[#8a8a8a]">{shop.contact_email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              shop.status === "Paused" ? "bg-[#f1f1f1] text-[#616161]" : "bg-[#e3f1df] text-[#008060]"
            }`}
          >
            {shop.status || "Active"}
          </span>
          <button onClick={toggleStatus} className="text-xs text-[#616161] underline-offset-2 hover:underline">
            {shop.status === "Paused" ? "Activate" : "Pause"}
          </button>
        </div>
      </div>

      <ShopRepoList shopId={id} linked={repos} onChange={load} selected={selected} onSelect={setSelected} />

      {selected && <CommitHistory repo={selected} />}

      <div className="rounded-lg border border-[#e3e3e3] bg-white">
        <div className="border-b border-[#e3e3e3] px-4 py-3">
          <p className="text-sm font-medium">Recent agent activity</p>
        </div>
        <div className="divide-y divide-[#f1f1f1]">
          {proposals.slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{p.failure_summary || p.error_type || "Pipeline failure"}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-[#8a8a8a]">
                  {p.repo_full_name} · {p.branch}
                </p>
              </div>
              <span className="rounded-full bg-[#f1f1f1] px-2 py-0.5 text-[11px] text-[#616161]">{p.status}</span>
            </div>
          ))}
          {proposals.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-[#8a8a8a]">No pipeline failures recorded for this shop.</p>
          )}
        </div>
      </div>
    </div>
  );
}