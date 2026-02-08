"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { useApp } from "@/app/context/AppContext";
import { formatINR } from "@/lib/currency";
import { LEAD_STATUSES } from "@/types";
import type { Lead } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  New: "#0ea5e9",
  Contacted: "#8b5cf6",
  Interested: "#f59e0b",
  "Follow-up": "#f97316",
  Converted: "#10b981",
  Lost: "#ef4444",
};
const STATUS_COLORS_ARR = Object.values(STATUS_COLORS);

interface DashboardChartsProps {
  leads?: Lead[];
}

export function DashboardCharts({ leads: leadsProp }: DashboardChartsProps) {
  const { leads: contextLeads, agents, role, currentAgentId } = useApp();
  const visibleLeads = leadsProp ?? (role === "agent" && currentAgentId
    ? contextLeads.filter((l) => l.assignedAgentId === currentAgentId)
    : contextLeads);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    LEAD_STATUSES.forEach((s) => { counts[s] = 0; });
    visibleLeads.forEach((l) => {
      counts[l.status] = (counts[l.status] ?? 0) + 1;
    });
    return LEAD_STATUSES.map((name) => ({ name, value: counts[name] ?? 0 })).filter((d) => d.value > 0);
  }, [visibleLeads]);

  const statusListWithCount = useMemo(() => {
    return LEAD_STATUSES.map((name) => ({
      name,
      count: visibleLeads.filter((l) => l.status === name).length,
      color: STATUS_COLORS[name] ?? "#94a3b8",
    }));
  }, [visibleLeads]);

  const trendData = useMemo(() => {
    const days: { date: string; dateLabel: string; newLeads: number; converted: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayStartD = new Date(d);
      dayStartD.setHours(0, 0, 0, 0);
      const dayEndD = new Date(d);
      dayEndD.setHours(23, 59, 59, 999);
      const dayStart = dayStartD.getTime();
      const dayEnd = dayEndD.getTime();
      const newLeads = visibleLeads.filter((l) => {
        if (!l.createdAt) return false;
        const t = new Date(l.createdAt).getTime();
        return t >= dayStart && t <= dayEnd;
      }).length;
      const converted = visibleLeads.filter((l) => {
        if (l.status !== "Converted" || !l.createdAt) return false;
        const t = new Date(l.createdAt).getTime();
        return t >= dayStart && t <= dayEnd;
      }).length;
      days.push({
        date: dateStr,
        dateLabel: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
        newLeads,
        converted,
      });
    }
    return days;
  }, [visibleLeads]);

  const top5Performers = useMemo(() => {
    return agents
      .map((agent) => {
        const agentLeads = visibleLeads.filter((l) => l.assignedAgentId === agent.id);
        const converted = agentLeads.filter((l) => l.status === "Converted");
        const convertedCount = converted.length;
        const amountGot = converted.reduce((s, l) => s + (l.convertedAmount ?? 0), 0);
        return {
          name: agent.name,
          converted: convertedCount,
          amountGot,
        };
      })
      .filter((p) => p.converted > 0 || p.amountGot > 0)
      .sort((a, b) => b.amountGot - a.amountGot)
      .slice(0, 5);
  }, [visibleLeads, agents]);

  return (
    <>
      {/* 1. Time trend – only chart that shows change over time */}
      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-900">Lead trend (last 7 days)</h2>
        <p className="mt-1 text-sm text-slate-500">New leads and conversions by date</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNewLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                formatter={(value: number, name: "Converted" | "New leads" | string) => [value, name === "newLeads" ? "New leads" : "Converted"]}
                labelFormatter={(_: unknown, payload: Array<{ payload?: { date?: string } }>) => payload?.[0]?.payload?.date ?? ""}
              />
              <Legend />
              <Area type="monotone" dataKey="newLeads" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorNewLeads)" name="New leads" strokeWidth={2} />
              <Area type="monotone" dataKey="converted" stroke="#10b981" fillOpacity={1} fill="url(#colorConverted)" name="Converted" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* 2. Pipeline: status breakdown (single view) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-900">Pipeline by status</h2>
          <p className="mt-1 text-sm text-slate-500">Where leads are in the funnel</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-52 w-52 shrink-0 sm:h-56 sm:w-56">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? STATUS_COLORS_ARR[i % STATUS_COLORS_ARR.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Leads"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">No leads</div>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              {statusListWithCount.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/80 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Top 5 performers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
          <h2 className="text-lg font-semibold text-slate-900">Top 5 performers</h2>
          <p className="mt-1 text-sm text-slate-500">By revenue from converted leads</p>
          <div className="mt-4">
            {top5Performers.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top5Performers} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => formatINR(v)} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip
                        formatter={(value: number) => [formatINR(value), "Revenue"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="amountGot" name="Revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {top5Performers.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/80 px-3 py-2">
                      <span className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-800">{p.name}</span>
                      </span>
                      <span className="text-sm tabular-nums text-slate-700">
                        {formatINR(p.amountGot)} <span className="text-slate-500">({p.converted} converted)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">
                No conversions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
