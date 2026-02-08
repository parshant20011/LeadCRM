"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useApp } from "@/app/context/AppContext";
import { useToast } from "@/app/context/ToastContext";
import { PageHeader } from "@/components/PageHeader";

export default function LeadRequestsPage() {
  const router = useRouter();
  const { role, leadOrders, agents, leads, bulkAssignLeads, decrementLeadOrderById } = useApp();
  const { toast } = useToast();

  const unassignedLeads = useMemo(
    () => leads.filter((l) => !l.assignedAgentId),
    [leads]
  );

  const ordersWithAgent = useMemo(() => {
    return leadOrders
      .filter((o) => o.count > 0)
      .map((order) => {
        const agent = agents.find((a) => a.id === order.agentId);
        return { order, agentName: agent?.name ?? "Unknown" };
      })
      .sort((a, b) => a.order.date.localeCompare(b.order.date) || (a.agentName.localeCompare(b.agentName)));
  }, [leadOrders, agents]);

  const handleAssign = (orderId: string, agentId: string, requestedCount: number) => {
    const toAssign = unassignedLeads.slice(0, requestedCount);
    if (toAssign.length === 0) {
      toast("No unassigned leads available.");
      return;
    }
    const leadIds = toAssign.map((l) => l.id);
    bulkAssignLeads(leadIds, agentId);
    decrementLeadOrderById(orderId, leadIds.length);
    toast(`Assigned ${leadIds.length} lead(s) to agent.`);
  };

  if (role !== "admin" && role !== "super_admin") {
    router.replace("/dashboard");
    return (
      <div className="flex min-h-[200px] items-center justify-center text-slate-500">
        Redirecting…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Lead Requests"
        description="Fulfill agent lead requests by assigning unassigned leads. Click Assign to assign the requested count from available unassigned leads."
      />

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-slate-600">Unassigned leads available: </span>
        <span className="font-semibold text-slate-900">{unassignedLeads.length}</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/50">
        {ordersWithAgent.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-slate-900">No lead requests</p>
              <p className="mt-1 text-sm text-slate-500">Agents can request leads from the Agent dashboard. Requests will appear here.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: card grid */}
            <div className="md:hidden space-y-4 p-4">
              {ordersWithAgent.map(({ order, agentName }) => {
                const canFulfill = Math.min(order.count, unassignedLeads.length) > 0;
                const assignCount = Math.min(order.count, unassignedLeads.length);
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-200/50"
                  >
                    <p className="font-medium text-slate-900">{agentName}</p>
                    <p className="mt-1 text-sm text-slate-600">{order.date}</p>
                    <p className="mt-2 text-sm">
                      <span className="text-slate-500">Requested: </span>
                      <span className="font-semibold tabular-nums text-slate-900">{order.count}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAssign(order.id, order.agentId, order.count)}
                      disabled={!canFulfill}
                      className="mt-4 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Assign{canFulfill && assignCount < order.count ? ` ${assignCount}` : ""}
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/80">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Agent</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Requested count</th>
                    <th className="w-32 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordersWithAgent.map(({ order, agentName }) => {
                    const canFulfill = Math.min(order.count, unassignedLeads.length) > 0;
                    const assignCount = Math.min(order.count, unassignedLeads.length);
                    return (
                      <tr key={order.id} className="transition-colors hover:bg-primary-50/30 border-b border-slate-100 last:border-0">
                        <td className="px-5 py-3.5 font-medium text-slate-900">{agentName}</td>
                        <td className="px-5 py-3.5 text-slate-600">{order.date}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">{order.count}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleAssign(order.id, order.agentId, order.count)}
                            disabled={!canFulfill}
                            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Assign{canFulfill && assignCount < order.count ? ` ${assignCount}` : ""}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
