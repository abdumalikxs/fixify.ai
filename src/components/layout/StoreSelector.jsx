import React, { useState } from "react";
import { Store, ChevronDown, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const STORES = ["urban-threads.myshopify.com", "northwind-supply.myshopify.com", "atlas-outdoor.myshopify.com"];

export default function StoreSelector() {
  const [store, setStore] = useState(STORES[0]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/[0.06]">
        <Store className="w-3.5 h-3.5 text-emerald-400" />
        <span className="max-w-[150px] truncate font-mono sm:max-w-none">{store}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-white/10 bg-[#0e1116] text-zinc-200">
        {STORES.map((s) => (
          <DropdownMenuItem key={s} onClick={() => setStore(s)} className="gap-2 font-mono text-xs focus:bg-white/10">
            <Check className={`w-3.5 h-3.5 ${s === store ? "opacity-100 text-emerald-400" : "opacity-0"}`} />
            {s}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}