import React from "react";
import { Link } from "react-router-dom";
import { Store, GitBranch, AlertCircle } from "lucide-react";

export default function ShopCard({ shop, repoCount = 0, openCount = 0 }) {
  const active = shop.status !== "Paused";
  return (
    <Link
      to={`/shops/${shop.id}`}
      className="block rounded-lg border border-[#e3e3e3] bg-white p-4 transition-colors hover:border-[#c9cccf]"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-[#f6f6f7] p-2">
          <Store className="h-4 w-4 text-[#616161]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{shop.name}</p>
          <p className="truncate text-xs text-[#8a8a8a]">{shop.domain || "no domain set"}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] ${
            active ? "bg-[#e3f1df] text-[#008060]" : "bg-[#f1f1f1] text-[#616161]"
          }`}
        >
          {shop.status || "Active"}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-[#616161]">
        <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> {repoCount} repositories</span>
        <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {openCount} open proposals</span>
      </div>
    </Link>
  );
}