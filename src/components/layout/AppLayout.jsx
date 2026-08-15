import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, GitBranch, ShieldCheck, Settings, Menu, X, Bot } from "lucide-react";
import StoreSelector from "./StoreSelector";

const nav = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Pipelines", path: "/pipelines", icon: GitBranch },
  { label: "Autopilot", path: "/autopilot", icon: Bot },
  { label: "Healed issues", path: "/healed", icon: ShieldCheck },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-[#1a1a1a] font-body">
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-[#e3e3e3] bg-white px-4 py-3 sm:px-6">
        <button className="lg:hidden text-[#616161]" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link to="/" className="text-[15px] font-semibold tracking-tight">
          Fixify<span className="text-[#008060]">.AI</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <StoreSelector />
          <div className="hidden items-center gap-2 text-xs text-[#616161] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#008060]" />
            Agent online
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-56 shrink-0 border-r border-[#e3e3e3] bg-white px-3 pt-20 transition-transform duration-200 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:translate-x-0 lg:pt-5 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-0.5">
            {nav.map(({ label, path, icon: Icon }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-[#f1f1f1] font-medium text-[#1a1a1a]" : "text-[#616161] hover:bg-[#f6f6f7]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}