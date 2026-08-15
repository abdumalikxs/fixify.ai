import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StorefrontHeader from "@/components/store/StorefrontHeader";
import ProductCard from "@/components/store/ProductCard";
import ThemeSourcePanel from "@/components/store/ThemeSourcePanel";
import { LUMINA_PRODUCTS } from "@/data/luminaProducts";

export default function Store() {
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);

  const products =
    category === "All" ? LUMINA_PRODUCTS : LUMINA_PRODUCTS.filter((p) => p.category === category);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#111827]">
      <StorefrontHeader active={category} onSelect={setCategory} cartCount={cart.length} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#111827]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Fixify
        </Link>

        <section className="mb-10 overflow-hidden rounded-2xl bg-[#111827] px-8 py-14 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9ca3af]">Autumn collection</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#ffffff] sm:text-4xl">
            See clearly. Look sharp.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#d1d5db]">
            Hand-finished acetate and Japanese titanium frames, cut for every face. Prescription-ready in 48 hours.
          </p>
        </section>

        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-sm font-medium">{category === "All" ? "All frames" : category}</h2>
          <p className="text-xs text-[#6b7280]">{products.length} products</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.handle} product={p} onAdd={(prod, variant) => setCart([...cart, { prod, variant }])} />
          ))}
        </div>

        <div className="mt-12">
          <h2 className="mb-1 text-sm font-medium">Theme source</h2>
          <p className="mb-4 text-xs text-[#6b7280]">
            This storefront is built from a standard Shopify theme. Two files on <span className="font-mono">main</span>{" "}
            currently fail Theme Check — the exact failures Fixify heals.
          </p>
          <ThemeSourcePanel />
        </div>
      </div>

      <footer className="border-t border-[#e5e7eb] bg-[#ffffff] px-6 py-8 text-center text-xs text-[#9ca3af]">
        Lumina Eyewear · lumina-eyewear.myshopify.com · demo storefront for Fixify.AI
      </footer>
    </div>
  );
}