"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo, useState } from "react";
import { useApp } from "@/app/context/AppContext";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { formatINR } from "@/lib/currency";
import { LEAD_STATUSES } from "@/types";

const DashboardCharts = dynamic(
  () => import("@/components/DashboardCharts").then((m) => ({ default: m.DashboardCharts })),
  { ssr: false, loading: () => <div className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-200" /> }
);

function getDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { leads, agents, leadOrders, role, currentAgentId } = useApp();
  const today = getDateString(new Date());
  const defaultFrom = getDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [agentFilter, setAgentFilter] = useState<string>("");

  const visibleLeads = useMemo(() => {
    let list = leads;
    if (agentFilter) {
      list = list.filter((l) => l.assignedAgentId === agentFilter);
    }
    if (dateFrom || dateTo) {
      const from = dateFrom ? (() => { const d = new Date(dateFrom); d.setHours(0, 0, 0, 0); return d.getTime(); })() : 0;
      const to = dateTo
        ? (() => { const d = new Date(dateTo); d.setHours(23, 59, 59, 999); return d.getTime(); })()
        : Number.MAX_SAFE_INTEGER;
      list = list.filter((l) => {
        if (!l.createdAt) return true;
        const created = new Date(l.createdAt).getTime();
        return created >= from && created <= to;
      });
    }
    return list;
  }, [leads, agentFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalLeads = visibleLeads.length;
    const assignedLeads = visibleLeads.filter((l) => l.assignedAgentId).length;
    const pendingLeads = visibleLeads.filter(
      (l) => l.assignedAgentId && !["Converted", "Lost"].includes(l.status)
    ).length;
    const convertedLeads = visibleLeads.filter((l) => l.status === "Converted").length;
    const lostLeads = visibleLeads.filter((l) => l.status === "Lost").length;
    const totalLeadCost = visibleLeads.reduce((s, l) => s + l.leadCost, 0);
    const totalPaid = visibleLeads.reduce((s, l) => s + (l.paid ?? 0), 0);
    const totalDue = visibleLeads.reduce((s, l) => s + (l.due ?? 0), 0);
    const totalAmountGot = visibleLeads
      .filter((l) => l.status === "Converted" && l.convertedAmount != null)
      .reduce((s, l) => s + (l.convertedAmount ?? 0), 0);
    // Profit/Loss for period: total lead cost - money earned (only shown to agent)
    const totalProfitLoss = totalLeadCost - totalAmountGot;
    const totalOrders = leadOrders.reduce((s, o) => s + o.count, 0);
    return {
      totalLeads,
      assignedLeads,
      pendingLeads,
      convertedLeads,
      lostLeads,
      totalLeadCost,
      totalPaid,
      totalDue,
      totalOrders,
      totalAmountGot,
      totalProfitLoss,
      agentsCount: agents.length,
    };
  }, [visibleLeads, leadOrders, agents.length]);

  const reportAgentWise = useMemo(() => {
    return agents.map((agent) => {
      const agentLeads = visibleLeads.filter((l) => l.assignedAgentId === agent.id);
      const cost = agentLeads.reduce((s, l) => s + l.leadCost, 0);
      const paid = agentLeads.reduce((s, l) => s + (l.paid ?? 0), 0);
      const due = agentLeads.reduce((s, l) => s + (l.due ?? 0), 0);
      const orders = leadOrders.filter((o) => o.agentId === agent.id).reduce((s, o) => s + o.count, 0);
      const converted = agentLeads.filter((l) => l.status === "Converted");
      const amountGot = converted.reduce((s, l) => s + (l.convertedAmount ?? 0), 0);
      const costOfConverted = converted.reduce((s, l) => s + l.leadCost, 0);
      const profitLoss = cost - amountGot; // total lead cost - money earned (for this agent's leads in period)
      return { agent: agent.name, count: agentLeads.length, cost, paid, due, orders, amountGot, profitLoss };
    });
  }, [agents, visibleLeads, leadOrders]);

  const reportStatusWise = useMemo(() => {
    return LEAD_STATUSES.map((status) => ({
      status,
      count: visibleLeads.filter((l) => l.status === status).length,
    }));
  }, [visibleLeads]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview, filters, and reports. Use date range and agent filter below."
      />

      {/* Filters - enhanced UI */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <span className="text-sm font-semibold text-slate-700">Filters</span>
        </div>
        <div className="flex flex-wrap items-end gap-5 px-5 py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[140px]">
              <label htmlFor="dashboard-date-from" className="mb-1 block text-xs font-medium text-slate-500">From date</label>
              <input
                id="dashboard-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="min-w-[140px]">
              <label htmlFor="dashboard-date-to" className="mb-1 block text-xs font-medium text-slate-500">To date</label>
              <input
                id="dashboard-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="min-w-[180px]">
              <label htmlFor="dashboard-agent" className="mb-1 block text-xs font-medium text-slate-500">Agent</label>
              <select
                id="dashboard-agent"
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All agents</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { setDateFrom(today); setDateTo(today); setAgentFilter(""); }}
              className="rounded-xl bg-primary-100 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-200"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              All time
            </button>
            <button
              type="button"
              onClick={() => { setDateFrom(defaultFrom); setDateTo(today); setAgentFilter(""); }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Last 30 days
            </button>
          </div>
          <div className="ml-auto flex items-center rounded-xl bg-slate-100 px-4 py-2.5">
            <span className="text-sm text-slate-600">Showing</span>
            <span className="ml-2 font-semibold text-slate-900">{visibleLeads.length}</span>
            <span className="ml-1 text-sm text-slate-600">leads</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        {role !== "agent" && (
          <StatCard
            title="All Agents"
            value={stats.agentsCount}
            sub="Count"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        )}
        <StatCard
          title="Assigned"
          value={stats.assignedLeads}
          sub="To agents"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          title="Pending"
          value={stats.pendingLeads}
          sub="In pipeline"
          valueClassName="text-yellow-600"
          iconClassName="bg-yellow-100 text-yellow-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Converted"
          value={stats.convertedLeads}
          valueClassName="text-emerald-600"
          iconClassName="bg-emerald-100 text-emerald-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Lost"
          value={stats.lostLeads}
          sub="Lead count"
          valueClassName="text-red-600"
          iconClassName="bg-red-100 text-red-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
        <StatCard
          title="Lead Cost"
          value={formatINR(stats.totalLeadCost)}
          sub="Total cost"
          valueClassName="text-indigo-600"
          iconClassName="bg-indigo-100 text-indigo-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Paid"
          value={formatINR(stats.totalPaid)}
          sub="To agents"
          valueClassName="text-emerald-600"
          iconClassName="bg-emerald-100 text-emerald-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Due"
          value={formatINR(stats.totalDue)}
          sub="Unpaid"
          valueClassName="text-amber-600"
          iconClassName="bg-amber-100 text-amber-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          }
        />
        {role === "agent" && (
          <StatCard
            title="Amount Got"
            value={formatINR(stats.totalAmountGot)}
            sub="From converted"
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        )}
        {role === "agent" && (
          <StatCard
            title="Profit / Loss"
            value={stats.totalProfitLoss > 0 ? formatINR(stats.totalProfitLoss) : stats.totalProfitLoss < 0 ? `+${formatINR(-stats.totalProfitLoss)}` : formatINR(0)}
            sub={stats.totalProfitLoss > 0 ? "Loss (cost − earned)" : stats.totalProfitLoss < 0 ? "Profit (earned − cost)" : "—"}
            valueClassName={stats.totalProfitLoss > 0 ? "text-red-600" : stats.totalProfitLoss < 0 ? "text-emerald-600" : "text-slate-900"}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        )}
        <StatCard
          title="Lead Orders"
          value={stats.totalOrders}
          sub="Requested"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v3m0 4v3a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-4l.01-6.378" />
            </svg>
          }
        />
      </div>

      <Suspense fallback={<div className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-200" />}>
        <DashboardCharts leads={visibleLeads} />
      </Suspense>

      {/* Reports section (merged from Reports page) */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Reports</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Agent-wise Leads & Orders</h3>
              <p className="mt-0.5 text-sm text-slate-500">Leads assigned and orders requested per agent</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/80">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-600">Agent</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-600">Leads</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-600">Orders</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-600">Cost</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-600">Due</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-600">Amount got</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-600">Profit / Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportAgentWise.map((row) => (
                    <tr key={row.agent} className="transition-colors hover:bg-primary-50/30 border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3 font-medium text-slate-900">{row.agent}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{row.count}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{row.orders}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{formatINR(row.cost)}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-amber-600">{formatINR(row.due)}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{formatINR(row.amountGot)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums font-medium ${row.profitLoss > 0 ? "text-red-600" : row.profitLoss < 0 ? "text-emerald-600" : "text-slate-700"}`}>
                        {row.profitLoss > 0 ? formatINR(row.profitLoss) : row.profitLoss < 0 ? `+${formatINR(-row.profitLoss)}` : formatINR(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <h3 className="font-semibold text-slate-900">Status-wise Leads</h3>
              <p className="mt-0.5 text-sm text-slate-500">Count by pipeline status</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/80">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-600">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-600">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportStatusWise.map((row) => (
                    <tr key={row.status} className="transition-colors hover:bg-primary-50/30 border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3 font-medium text-slate-900">{row.status}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-700">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
