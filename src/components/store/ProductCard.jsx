import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { Check } from "lucide-react";

export default function ProductCard({ product, onAdd }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [added, setAdded] = useState(false);

  const add = () => {
    onAdd(product, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#ffffff]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f5f2]">
        <Image
          src={product.image}
          alt={product.title}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#ffffff]">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">{product.category}</p>
        <h3 className="mt-1 text-sm font-medium text-[#111827]">{product.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">{product.blurb}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-[#111827]">${product.price}</span>
          {product.compare_at && (
            <span className="text-xs text-[#9ca3af] line-through">${product.compare_at}</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.variants.map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                variant === v
                  ? "border-[#111827] bg-[#111827] text-[#ffffff]"
                  : "border-[#e5e7eb] text-[#4b5563] hover:border-[#9ca3af]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          onClick={add}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#111827] py-2.5 text-xs font-medium text-[#ffffff] transition-opacity hover:opacity-90"
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added to cart
            </>
          ) : (
            "Add to cart"
          )}
        </button>
      </div>
    </div>
  );
}