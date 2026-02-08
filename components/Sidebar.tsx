"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import type { UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  agent: "Agent",
};

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", roles: ["super_admin", "admin", "agent"] },
  { href: "/leads", label: "Leads", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", roles: ["super_admin", "admin"] },
  { href: "/lead-requests", label: "Lead Requests", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", roles: ["super_admin", "admin"] },
  { href: "/agents", label: "Agents", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", roles: ["super_admin", "admin"] },
  { href: "/agent", label: "My Leads", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", roles: ["agent"] },
  { href: "/admins", label: "Admins", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", roles: ["super_admin"] },
];

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const { role, setRole } = useApp();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-[transform,width] duration-200 ease-in-out lg:sticky ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
      <div className="flex h-14 items-center border-b border-slate-200 px-3">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          {!collapsed && (
            <span className="truncate text-lg font-semibold text-slate-900">Lead CRM</span>
          )}
        </Link>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {allNavItems.filter((item) => item.roles.includes(role)).map(({ href, label, icon }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              onClick={() => onMobileClose?.()}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`border-t border-slate-200 p-3 ${collapsed ? "flex flex-col items-center gap-2" : "space-y-3"}`}>
        <div className={collapsed ? "" : "space-y-1.5"}>
          {!collapsed && (
            <label className="block text-xs font-medium text-slate-500">Role (demo)</label>
          )}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              collapsed ? "w-10 px-1 py-1.5" : ""
            }`}
          >
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
              <option key={r} value={r}>
                {collapsed ? r.slice(0, 1) : ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">
              {role === "agent" ? "A" : role === "admin" ? "M" : "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {ROLE_LABELS[role]}
              </p>
              <p className="truncate text-xs text-slate-500">Demo user</p>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
