"use client";

import { useState } from "react";
import { useApp } from "@/app/context/AppContext";
import { useToast } from "@/app/context/ToastContext";
import { formatINR } from "@/lib/currency";
import { LEAD_STATUSES } from "@/types";
import type { Lead, LeadStatus } from "@/types";
import { StatCard } from "@/components/StatCard";
import { ConvertedAmountModal } from "@/components/ConvertedAmountModal";
import { CallConfirmModal } from "@/components/CallConfirmModal";
import { PhoneActions } from "@/components/PhoneActions";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

function getDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AgentPage() {
  const { role, leads, agents, leadOrders, updateLeadStatus, currentAgentId, addLeadOrder, updateLeadPhone } = useApp();
  const { toast } = useToast();
  const [convertModalLead, setConvertModalLead] = useState<Lead | null>(null);
  const [callModalLead, setCallModalLead] = useState<Lead | null>(null);
  const today = getDateString(new Date());
  const tomorrow = getDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [orderDate, setOrderDate] = useState(tomorrow);
  const [orderCount, setOrderCount] = useState(10);

  const myLeads = currentAgentId
    ? leads.filter((l) => l.assignedAgentId === currentAgentId)
    : leads;
  const agentName = currentAgentId ? agents.find((a) => a.id === currentAgentId)?.name : "All agents";
  const myOrdersTotal = currentAgentId
    ? leadOrders.filter((o) => o.agentId === currentAgentId).reduce((s, o) => s + o.count, 0)
    : 0;

  const totalCost = myLeads.reduce((s, l) => s + l.leadCost, 0);
  const paid = myLeads.reduce((s, l) => s + (l.paid ?? 0), 0);
  const due = myLeads.reduce((s, l) => s + (l.due ?? 0), 0);

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgentId || orderCount < 1) return;
    addLeadOrder(currentAgentId, orderDate, orderCount);
    toast(`Order of ${orderCount} leads for ${orderDate} added.`);
    setOrderCount(10);
  };

  return (
    <div>
      <PageHeader
        title="Agent Dashboard"
        description={
          role === "agent"
            ? `Your assigned leads and earnings. Use the dropdown in the navbar to switch agent.`
            : `Viewing as: ${agentName}. Switch role to "Agent" to see agent-only view.`
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Assigned Leads"
          value={myLeads.length}
          valueClassName="text-primary-600"
          iconClassName="bg-primary-100 text-primary-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Lead Orders"
          value={myOrdersTotal}
          sub="Requested"
          valueClassName="text-amber-600"
          iconClassName="bg-amber-100 text-amber-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          title="Total Lead Cost"
          value={formatINR(totalCost)}
          valueClassName="text-indigo-600"
          iconClassName="bg-indigo-100 text-indigo-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Paid"
          value={formatINR(paid)}
          valueClassName="text-emerald-600"
          iconClassName="bg-emerald-100 text-emerald-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Due"
          value={formatINR(due)}
          valueClassName="text-amber-600"
          iconClassName="bg-amber-100 text-amber-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          }
        />
      </div>

      {currentAgentId && (
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">New lead order</h2>
          <p className="mt-1 text-sm text-slate-500">Request leads for a date. Admin will see this in dashboard and listings.</p>
          <form onSubmit={handleAddOrder} className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="order-date" className="mb-1 block text-xs font-medium text-slate-500">Date</label>
              <input
                id="order-date"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                min={today}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setOrderDate(tomorrow)}
              className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              Next day
            </button>
            <div>
              <label htmlFor="order-count" className="mb-1 block text-xs font-medium text-slate-500">Number of leads</label>
              <input
                id="order-count"
                type="number"
                min={1}
                value={orderCount}
                onChange={(e) => setOrderCount(parseInt(e.target.value, 10) || 1)}
                className="w-28 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Add order
            </button>
          </form>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">My Leads</h2>
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">{myLeads.length}</span> lead{myLeads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/80">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Lead
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Phone</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Cost</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Due</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Amount got</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="mt-4 font-medium text-slate-900">No assigned leads</p>
                        <p className="mt-1 text-sm text-slate-500">Leads assigned to you will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myLeads.map((lead) => (
                    <tr key={lead.id} className="group transition-colors hover:bg-primary-50/30 border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                            {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <PhoneActions
                          lead={lead}
                          onCallClick={setCallModalLead}
                          onCopy={() => toast("Number copied")}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={lead.status} />
                          <select
                            value={lead.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as LeadStatus;
                              if (newStatus === "Converted") setConvertModalLead(lead);
                              else updateLeadStatus(lead.id, newStatus);
                            }}
                            className="rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-7 text-xs text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            aria-label="Change status"
                          >
                            {LEAD_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums text-indigo-600">{formatINR(lead.leadCost)}</td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums text-amber-600">{formatINR(lead.due ?? 0)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                        {lead.status === "Converted" && lead.convertedAmount != null
                          ? formatINR(lead.convertedAmount)
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {convertModalLead && (
        <ConvertedAmountModal
          lead={convertModalLead}
          onClose={() => setConvertModalLead(null)}
          onConfirm={(amount) => {
            updateLeadStatus(convertModalLead.id, "Converted", amount);
            setConvertModalLead(null);
          }}
        />
      )}
      {callModalLead && (
        <CallConfirmModal
          phone={callModalLead.phone}
          leadName={callModalLead.name}
          leadId={callModalLead.id}
          onClose={() => setCallModalLead(null)}
          onUpdatePhone={updateLeadPhone}
        />
      )}
    </div>
  );
}
