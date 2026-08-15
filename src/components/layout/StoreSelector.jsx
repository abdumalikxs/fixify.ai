import React, { useState } from "react";
import { Store, ChevronDown, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const STORES = ["urban-threads.myshopify.com", "northwind-supply.myshopify.com", "atlas-outdoor.myshopify.com"];

export default function StoreSelector() {
  const [store, setStore] = useState(STORES[0]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-[#e3e3e3] bg-white px-3 py-1.5 text-xs text-[#1a1a1a] transition-colors hover:bg-[#f6f6f7]">
        <Store className="w-3.5 h-3.5 text-[#616161]" />
        <span className="max-w-[150px] truncate font-mono sm:max-w-none">{store}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#8a8a8a]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-[#e3e3e3] bg-white">
        {STORES.map((s) => (
          <DropdownMenuItem key={s} onClick={() => setStore(s)} className="gap-2 font-mono text-xs">
            <Check className={`w-3.5 h-3.5 ${s === store ? "opacity-100 text-[#008060]" : "opacity-0"}`} />
            {s}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}