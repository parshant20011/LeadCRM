"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/app/context/ToastContext";
import { formatINR } from "@/lib/currency";
import type { Agent } from "@/types";

export default function AgentsPage() {
  const { agents, leads, leadOrders, addAgent, markAgentPaid, deleteAgent } = useApp();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [markPaidAgent, setMarkPaidAgent] = useState<{ agent: Agent; due: number } | null>(null);
  const [deleteConfirmAgent, setDeleteConfirmAgent] = useState<Agent | null>(null);
  const [payMode, setPayMode] = useState<"amount" | "full">("full");
  const [payAmount, setPayAmount] = useState("");

  const [searchFilter, setSearchFilter] = useState("");
  const [dueFilter, setDueFilter] = useState<"all" | "has_due" | "no_due">("all");

  const agentStats = useMemo(() => {
    return agents
      .map((agent) => {
        const assignedLeads = leads.filter((l) => l.assignedAgentId === agent.id);
        const count = assignedLeads.length;
        const totalCost = assignedLeads.reduce((s, l) => s + l.leadCost, 0);
        const paid = assignedLeads.reduce((s, l) => s + (l.paid ?? 0), 0);
        const due = assignedLeads.reduce((s, l) => s + (l.due ?? 0), 0);
        const orderCount = leadOrders.filter((o) => o.agentId === agent.id).reduce((s, o) => s + o.count, 0);
        const amountGot = assignedLeads
          .filter((l) => l.status === "Converted")
          .reduce((s, l) => s + (l.convertedAmount ?? 0), 0);
        const profitLoss = amountGot - totalCost; // positive = profit, negative = loss
        return {
          agent,
          leadsCount: count,
          orderCount,
          totalCost,
          paid,
          due,
          amountGot,
          profitLoss,
        };
      })
      .filter((row) => {
        const matchSearch =
          !searchFilter ||
          row.agent.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          row.agent.email.toLowerCase().includes(searchFilter.toLowerCase());
        const matchDue =
          dueFilter === "all" ||
          (dueFilter === "has_due" && row.due > 0) ||
          (dueFilter === "no_due" && row.due === 0);
        return matchSearch && matchDue;
      });
  }, [agents, leads, leadOrders, searchFilter, dueFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tName = name.trim();
    const tEmail = email.trim();
    if (!tName || !tEmail) return;
    addAgent(tName, tEmail);
    toast(`Agent "${tName}" added successfully`);
    setName("");
    setEmail("");
    setModalOpen(false);
  };

  const handleMarkPaidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markPaidAgent) return;
    if (payMode === "full") {
      markAgentPaid(markPaidAgent.agent.id, { type: "full" });
      toast(`Marked all dues as fully paid for ${markPaidAgent.agent.name}`);
    } else {
      const num = parseFloat(payAmount);
      if (Number.isNaN(num) || num <= 0) return;
      markAgentPaid(markPaidAgent.agent.id, { type: "amount", amount: num });
      toast(`Recorded payment of ${formatINR(num)} for ${markPaidAgent.agent.name}`);
    }
    setMarkPaidAgent(null);
    setPayAmount("");
    setPayMode("full");
  };

  return (
    <div>
      <PageHeader
        title="Agents"
        description="Manage agents under you. View leads assigned, total cost, and amount due to each agent."
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8v8H4V4h8z" />
            </svg>
            Add Agent
          </button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <label className="sr-only">Search agents</label>
        <input
          type="search"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search by name or email..."
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <select
          value={dueFilter}
          onChange={(e) => setDueFilter(e.target.value as "all" | "has_due" | "no_due")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="all">All agents</option>
          <option value="has_due">Has due amount</option>
          <option value="no_due">No due</option>
        </select>
        <span className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{agentStats.length}</span> agent{agentStats.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/50">
        {agents.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-slate-900">No agents yet</p>
              <p className="mt-1 text-sm text-slate-500">Add an agent under you to start assigning leads.</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                Add Agent
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/80">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Agent</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Email</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Leads assigned</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Lead orders</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Total lead cost</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Paid</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Due to agent</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Profit / Loss</th>
                  <th className="w-40 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentStats.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-500">
                      No agents match your filters. Try changing search or due filter.
                    </td>
                  </tr>
                ) : (
                agentStats.map(({ agent, leadsCount, orderCount, totalCost, paid, due, profitLoss }) => (
                  <tr key={agent.id} className="transition-colors hover:bg-primary-50/30 border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                          {agent.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-slate-900">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{agent.email}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium tabular-nums text-slate-700">
                        {leadsCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium tabular-nums text-amber-800">
                        {orderCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium tabular-nums text-slate-900">
                      {formatINR(totalCost)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm tabular-nums text-emerald-600">
                      {formatINR(paid)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-amber-600">
                      {formatINR(due)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-medium tabular-nums ${
                          profitLoss > 0 ? "text-emerald-600" : profitLoss < 0 ? "text-red-600" : "text-slate-600"
                        }`}
                      >
                        {profitLoss > 0 ? `+${formatINR(profitLoss)}` : formatINR(profitLoss)}
                      </span>
                      <span className="ml-1 text-xs text-slate-500">
                        {profitLoss > 0 ? "Profit" : profitLoss < 0 ? "Loss" : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {due > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setMarkPaidAgent({ agent, due });
                              setPayMode("full");
                              setPayAmount("");
                            }}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Mark paid
                          </button>
                        )}
                        <Link
                          href={`/leads?agent=${agent.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          View leads
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAgent(agent)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          title="Delete agent"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirmAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Delete Agent</h2>
            <p className="mt-2 text-sm text-slate-600">
              Delete &quot;{deleteConfirmAgent.name}&quot;? Their leads will be unassigned. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAgent(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAgent(deleteConfirmAgent.id);
                  setDeleteConfirmAgent(null);
                  toast("Agent deleted");
                }}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {markPaidAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Mark paid</h2>
            <p className="mt-1 text-sm text-slate-500">
              Record payment for <span className="font-medium text-slate-700">{markPaidAgent.agent.name}</span>. Due: {formatINR(markPaidAgent.due)}.
            </p>
            <form onSubmit={handleMarkPaidSubmit} className="mt-5 space-y-4">
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <input
                    type="radio"
                    name="payMode"
                    checked={payMode === "full"}
                    onChange={() => setPayMode("full")}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="text-sm font-medium text-slate-900">Mark fully paid</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <input
                    type="radio"
                    name="payMode"
                    checked={payMode === "amount"}
                    onChange={() => setPayMode("amount")}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="text-sm font-medium text-slate-900">Pay certain amount</span>
                </label>
                {payMode === "amount" && (
                  <div className="ml-7">
                    <label htmlFor="pay-amount" className="block text-xs font-medium text-slate-500">Amount (₹)</label>
                    <input
                      id="pay-amount"
                      type="number"
                      min={0}
                      step={0.01}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setMarkPaidAgent(null); setPayAmount(""); setPayMode("full"); }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payMode === "amount" && (Number.isNaN(parseFloat(payAmount)) || parseFloat(payAmount) <= 0)}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Add Agent</h2>
            <p className="mt-1 text-sm text-slate-500">Add a new agent under you. They will appear in the list and you can assign leads to them.</p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="agent-name" className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              <div>
                <label htmlFor="agent-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="agent-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. priya@company.in"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setName(""); setEmail(""); }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Add Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
