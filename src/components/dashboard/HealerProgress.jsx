import React from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function HealerProgress({ steps, activeIndex }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-[#e3e3e3] bg-[#fafafa] p-4"
    >
      <div className="space-y-2">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <div
              key={s}
              className={`flex items-center gap-2.5 font-mono text-[12px] ${
                done ? "text-[#006b55]" : active ? "text-[#1a1a1a]" : "text-[#b5b5b5]"
              }`}
            >
              {done ? (
                <Check className="w-3.5 h-3.5" />
              ) : active ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-[#e3e3e3]" />
              )}
              {s}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}