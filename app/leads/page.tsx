"use client";

import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { useToast } from "@/app/context/ToastContext";
import { AssignModal } from "@/components/AssignModal";
import { ViewLeadModal } from "@/components/ViewLeadModal";
import { ConvertedAmountModal } from "@/components/ConvertedAmountModal";
import { CallConfirmModal } from "@/components/CallConfirmModal";
import { PhoneActions } from "@/components/PhoneActions";
import { AddLeadSheet } from "@/components/AddLeadSheet";
import { UploadLeadsModal } from "@/components/UploadLeadsModal";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR } from "@/lib/currency";
import { LEAD_STATUSES } from "@/types";
import type { Lead, LeadStatus } from "@/types";

function LeadRowInitial({ name }: { name: string }) {
  const initial = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
      {initial}
    </div>
  );
}

export default function LeadsPage() {
  const { leads, agents, leadOrders, role, updateLeadStatus, updateLeadCost, bulkAssignLeads, deleteLead, updateLeadPhone } = useApp();
  const [convertModalLead, setConvertModalLead] = useState<Lead | null>(null);
  const totalOrderCount = leadOrders.reduce((s, o) => s + o.count, 0);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [agentFilter, setAgentFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [assignModalLead, setAssignModalLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const agentId = params.get("agent");
    if (agentId) setAgentFilter(agentId);
  }, []);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAgentId, setBulkAgentId] = useState("");
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [costInput, setCostInput] = useState("");
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [callModalLead, setCallModalLead] = useState<Lead | null>(null);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (agentFilter && l.assignedAgentId !== agentFilter) return false;
      if (dateFrom || dateTo) {
        const created = l.createdAt ? new Date(l.createdAt).getTime() : 0;
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          if (created < from.getTime()) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (created > to.getTime()) return false;
        }
      }
      return true;
    });
  }, [leads, statusFilter, agentFilter, dateFrom, dateTo]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
  };

  const { toast } = useToast();

  const handleBulkAssign = () => {
    if (!bulkAgentId || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const createdAts = ids.map((id) => leads.find((l) => l.id === id)?.createdAt);
    bulkAssignLeads(ids, bulkAgentId, createdAts);
    toast(`Assigned ${selectedIds.size} lead(s) successfully`);
    setSelectedIds(new Set());
    setBulkAgentId("");
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description={
          agentFilter
            ? `Showing leads assigned to ${agents.find((a) => a.id === agentFilter)?.name ?? "this agent"} only.`
            : role !== "agent" && totalOrderCount > 0
              ? `Filter, assign, and update status. Lead orders requested: ${totalOrderCount} (see Dashboard).`
              : "Filter, assign, and update status. Select rows for bulk assign."
        }
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </button>
            <button
              type="button"
              onClick={() => setAddSheetOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
        }
      />

      <div className="mt-6 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="relative">
            <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value || "") as LeadStatus | "")}
              className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-8 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
          <div className="relative">
            <label className="mb-1 block text-xs font-medium text-slate-500">Agent</label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="h-10 min-w-[160px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-8 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">From date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">To date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="flex items-center rounded-lg bg-slate-100 px-4 py-2">
            <span className="text-sm text-slate-600">Showing</span>
            <span className="ml-2 font-semibold text-slate-900">{filteredLeads.length}</span>
            <span className="ml-1 text-sm text-slate-600">lead{filteredLeads.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/80 px-4 py-3 backdrop-blur-sm">
          <span className="text-sm font-semibold text-primary-800">
            {selectedIds.size} selected
          </span>
          <select
            value={bulkAgentId}
            onChange={(e) => setBulkAgentId(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Select agent</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleBulkAssign}
            disabled={!bulkAgentId}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600"
          >
            Bulk assign
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900"
          >
            Clear
          </button>
        </div>
      )}

      {/* Mobile: card grid */}
      <div className="mt-6 md:hidden space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-slate-900">No leads match your filters</p>
            <p className="mt-1 text-sm text-slate-500">Try changing status or agent, or upload more leads.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-200/50"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(lead.id)}
                  onChange={() => toggleSelect(lead.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <LeadRowInitial name={lead.name} />
                    <span className="font-medium text-slate-900 truncate">{lead.name}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <PhoneActions lead={lead} onCallClick={setCallModalLead} onCopy={() => toast("Number copied")} />
                  </div>
                  <div className="mt-2">
                    {lead.assignedAgentId ? (
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {agents.find((a) => a.id === lead.assignedAgentId)?.name ?? "—"}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={lead.status} />
                    <select
                      value={lead.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as LeadStatus;
                        if (newStatus === "Converted") setConvertModalLead(lead);
                        else updateLeadStatus(lead.id, newStatus);
                      }}
                      className="rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-7 text-xs text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Cost</span>
                    {editingCostId === lead.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={costInput}
                          onChange={(e) => setCostInput(e.target.value)}
                          onBlur={() => {
                            const num = parseInt(costInput, 10);
                            if (!Number.isNaN(num) && num >= 0) updateLeadCost(lead.id, num);
                            setEditingCostId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const num = parseInt(costInput, 10);
                              if (!Number.isNaN(num) && num >= 0) updateLeadCost(lead.id, num);
                              setEditingCostId(null);
                            }
                          }}
                          className="w-20 rounded border border-slate-200 py-1 pr-1 text-right text-sm tabular-nums"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setEditingCostId(lead.id); setCostInput(String(lead.leadCost)); }}
                        className="text-sm font-medium tabular-nums text-slate-900 hover:text-primary-600"
                      >
                        {formatINR(lead.leadCost)}
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setAssignModalLead(lead)} className="rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700">Assign</button>
                    <button type="button" onClick={() => setViewLead(lead)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">View</button>
                    <button type="button" onClick={() => setDeleteConfirmLead(lead)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="mt-6 hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/50">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/80">
                <th className="w-12 px-5 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && selectedIds.size === filteredLeads.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                  />
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Lead</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Phone</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Agent</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Cost</th>
                <th className="w-32 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="mt-4 font-medium text-slate-900">No leads match your filters</p>
                      <p className="mt-1 text-sm text-slate-500">Try changing status or agent, or upload more leads.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="group transition-colors hover:bg-primary-50/30 border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <LeadRowInitial name={lead.name} />
                        <span className="font-medium text-slate-900">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <PhoneActions
                        lead={lead}
                        onCallClick={setCallModalLead}
                        onCopy={() => toast("Number copied")}
                      />
                    </td>
                    <td className="px-5 py-4">
                      {lead.assignedAgentId ? (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {agents.find((a) => a.id === lead.assignedAgentId)?.name ?? "—"}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} />
                        <select
                          value={lead.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as LeadStatus;
                            if (newStatus === "Converted") {
                              setConvertModalLead(lead);
                            } else {
                              updateLeadStatus(lead.id, newStatus);
                            }
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
                    <td className="px-5 py-4 text-right">
                      {editingCostId === lead.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-500">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={costInput}
                            onChange={(e) => setCostInput(e.target.value)}
                            onBlur={() => {
                              const num = parseInt(costInput, 10);
                              if (!Number.isNaN(num) && num >= 0) updateLeadCost(lead.id, num);
                              setEditingCostId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const num = parseInt(costInput, 10);
                                if (!Number.isNaN(num) && num >= 0) updateLeadCost(lead.id, num);
                                setEditingCostId(null);
                              }
                            }}
                            className="w-20 rounded border border-slate-200 py-1 pr-1 text-right text-sm tabular-nums"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCostId(lead.id);
                            setCostInput(String(lead.leadCost));
                          }}
                          className="text-sm font-medium tabular-nums text-slate-900 hover:text-primary-600 hover:underline"
                        >
                          {formatINR(lead.leadCost)}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setAssignModalLead(lead)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-primary-50"
                        >
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewLead(lead)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmLead(lead)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          title="Delete lead"
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
      </div>

      {assignModalLead && (
        <AssignModal lead={assignModalLead} onClose={() => setAssignModalLead(null)} />
      )}
      {viewLead && (
        <ViewLeadModal
          lead={viewLead}
          onClose={() => setViewLead(null)}
          onDelete={() => { deleteLead(viewLead.id); setViewLead(null); }}
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
      {deleteConfirmLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Delete Lead</h2>
            <p className="mt-2 text-sm text-slate-600">
              Delete &quot;{deleteConfirmLead.name}&quot;? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLead(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteLead(deleteConfirmLead.id);
                  setDeleteConfirmLead(null);
                  toast("Lead deleted");
                }}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
      <AddLeadSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSuccess={() => toast("Lead added successfully")}
      />
      <UploadLeadsModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
