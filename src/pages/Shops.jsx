import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import ShopCard from "@/components/shops/ShopCard";
import AddShopDialog from "@/components/shops/AddShopDialog";
import { Store } from "lucide-react";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [repos, setRepos] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [s, r, p] = await Promise.all([
      base44.entities.Shop.list("-created_date"),
      base44.entities.MonitoredRepo.list(),
      base44.entities.FixProposal.filter({ status: "Proposed" }),
    ]);
    setShops(s);
    setRepos(r);
    setProposals(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const countsFor = (shopId) => {
    const mine = repos.filter((r) => r.shop_id === shopId);
    const names = new Set(mine.map((r) => r.full_name));
    return {
      repoCount: mine.length,
      openCount: proposals.filter((p) => names.has(p.repo_full_name)).length,
    };
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Connected shops</h1>
          <p className="mt-1 text-sm text-[#616161]">Every store on the platform, with its repositories and commit history.</p>
        </div>
        <AddShopDialog onCreated={load} />
      </div>

      {loading ? (
        <p className="text-sm text-[#8a8a8a]">Loading shops…</p>
      ) : shops.length === 0 ? (
        <div className="rounded-lg border border-[#e3e3e3] bg-white p-10 text-center">
          <Store className="mx-auto h-6 w-6 text-[#c9cccf]" />
          <p className="mt-3 text-sm font-medium">No shops connected yet</p>
          <p className="mt-1 text-xs text-[#616161]">Add your first shop to link its repositories.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => {
            const c = countsFor(shop.id);
            return <ShopCard key={shop.id} shop={shop} repoCount={c.repoCount} openCount={c.openCount} />;
          })}
        </div>
      )}
    </div>
  );
}