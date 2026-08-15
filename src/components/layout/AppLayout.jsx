import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Zap, LayoutDashboard, GitBranch, ShieldCheck, Settings, Menu, X } from "lucide-react";
import StoreSelector from "./StoreSelector";

const nav = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Pipelines", path: "/pipelines", icon: GitBranch },
  { label: "Healed Issues", path: "/healed", icon: ShieldCheck },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100 font-body">
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-white/5 bg-[#0b0d11]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <button className="lg:hidden text-zinc-400" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 text-black">
            <Zap className="w-4 h-4" />
          </span>
          <span className="text-[15px]">Fixify<span className="text-amber-400">.AI</span></span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <StoreSelector />
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Agent online
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 shrink-0 border-r border-white/5 bg-[#0b0d11] px-3 pt-20 transition-transform duration-300 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:translate-x-0 lg:pt-6 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Workspace</p>
          <nav className="space-y-1">
            {nav.map(({ label, path, icon: Icon }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}