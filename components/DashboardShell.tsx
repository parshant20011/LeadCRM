"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "./Toast";
import { useApp } from "@/app/context/AppContext";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, agents, currentAgentId, setSelectedAgentId } = useApp();

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={`transition-[margin-left] duration-200 ease-in-out ${
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
        }`}
      >
        <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          {role === "agent" && agents.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="agent-select" className="text-sm font-medium text-slate-600">
                View as:
              </label>
              <select
                id="agent-select"
                value={currentAgentId ?? ""}
                onChange={(e) => setSelectedAgentId(e.target.value || null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div
          data-main-scroll
          className="h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden overscroll-contain [overflow-anchor:none]"
        >
          {children}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
