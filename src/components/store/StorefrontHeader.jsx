import React from "react";
import { ShoppingBag, Search, ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/data/luminaProducts";

export default function StorefrontHeader({ active, onSelect, cartCount }) {
  return (
    <header className="border-b border-[#e5e7eb] bg-[#ffffff]">
      <div className="flex items-center justify-center gap-2 bg-[#111827] px-4 py-2 text-[11px] tracking-wide text-[#f3f4f6]">
        Free shipping &amp; free returns on every pair
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-5">
        <p className="text-lg font-semibold tracking-[0.18em] text-[#111827]">LUMINA</p>

        <nav className="hidden items-center gap-6 md:flex">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className={`text-sm transition-colors ${
                active === c ? "text-[#111827] underline underline-offset-8" : "text-[#4b5563] hover:text-[#111827]"
              }`}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => onSelect("All")}
            className={`text-sm transition-colors ${
              active === "All" ? "text-[#111827] underline underline-offset-8" : "text-[#4b5563] hover:text-[#111827]"
            }`}
          >
            All
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button className="hidden items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3 py-1.5 text-xs text-[#4b5563] sm:flex">
            lumina-eyewear.myshopify.com
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <Search className="h-4 w-4 text-[#4b5563]" />
          <div className="relative">
            <ShoppingBag className="h-5 w-5 text-[#111827]" />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111827] px-1 text-[10px] font-medium text-[#ffffff]">
              {cartCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-auto border-t border-[#f3f4f6] px-6 py-2 md:hidden">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`whitespace-nowrap text-xs ${active === c ? "text-[#111827]" : "text-[#6b7280]"}`}
          >
            {c}
          </button>
        ))}
      </div>
    </header>
  );
}