import React from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function HealerProgress({ steps, activeIndex }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-300">Agent run in progress</p>
      <div className="space-y-2.5">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <div key={s} className={`flex items-center gap-3 font-mono text-[12.5px] ${done ? "text-emerald-300" : active ? "text-zinc-100" : "text-zinc-600"}`}>
              {done ? <Check className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />}
              {s}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}