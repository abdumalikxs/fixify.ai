import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, GitBranch, Settings, Menu, X, Bot, Store, Glasses, FileJson } from "lucide-react";
import StoreSelector from "./StoreSelector";

const sections = [
  {
    title: "Monitor",
    items: [
      { label: "Overview", path: "/", icon: LayoutDashboard },
      { label: "Deploy history", path: "/pipelines", icon: GitBranch },
    ],
  },
  {
    title: "Heal",
    items: [
      { label: "Autopilot", path: "/autopilot", icon: Bot, alsoActiveOn: ["/healed"] },
      { label: "Theme audit", path: "/theme-audit", icon: FileJson },
    ],
  },
  {
    title: "Configure",
    items: [
      { label: "Connected shops", path: "/shops", icon: Store },
      { label: "Settings", path: "/settings", icon: Settings },
      { label: "Lumina demo store", path: "/store", icon: Glasses },
    ],
  },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-body">
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-[#30363d] bg-[#161b22] px-4 py-2.5 text-[#f0f6fc] sm:px-6">
        <button className="lg:hidden text-[#c8d1d9]" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Bot className="h-5 w-5" />
          Fixify<span className="font-normal text-[#8b949e]">/</span>
          <span className="font-normal">autopilot</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <StoreSelector />
          <div className="hidden items-center gap-2 rounded-full border border-[#3d444d] px-2.5 py-1 text-[11px] text-[#c8d1d9] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
            Agent online
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 shrink-0 border-r border-[#d1d9e0] bg-white px-2 pt-20 transition-transform duration-200 lg:sticky lg:top-[49px] lg:h-[calc(100vh-49px)] lg:translate-x-0 lg:pt-4 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-4">
            {sections.map(({ title, items }) => (
              <div key={title} className="space-y-px">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">{title}</p>
                {items.map(({ label, path, icon: Icon, alsoActiveOn = [] }) => {
                  const active = pathname === path || alsoActiveOn.includes(pathname);
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setOpen(false)}
                      className={`relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-[#f6f8fa] font-semibold text-[#1f2328]"
                          : "text-[#1f2328] hover:bg-[#f6f8fa]"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#fd8c73]" />
                      )}
                      <Icon className={`h-4 w-4 ${active ? "text-[#1f2328]" : "text-[#59636e]"}`} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}