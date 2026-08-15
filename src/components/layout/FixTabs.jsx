import React from "react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { label: "Fix queue", path: "/autopilot" },
  { label: "Healed", path: "/healed" },
];

export default function FixTabs() {
  const { pathname } = useLocation();
  return (
    <div className="flex gap-1 border-b border-[#e3e3e3]">
      {tabs.map(({ label, path }) => {
        const active = pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
              active
                ? "border-[#fd8c73] font-semibold text-[#1a1a1a]"
                : "border-transparent text-[#616161] hover:text-[#1a1a1a]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}