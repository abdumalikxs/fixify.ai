import React from "react";

export default function StatCard({ label, value, hint, Icon, tone = "text-[#1a1a1a]" }) {
  return (
    <div className="rounded-lg border border-[#e3e3e3] bg-white px-4 py-3.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#616161]">{label}</p>
        {Icon && <Icon className={`h-4 w-4 ${tone}`} />}
      </div>
      <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-[#8a8a8a]">{hint}</p>}
    </div>
  );
}