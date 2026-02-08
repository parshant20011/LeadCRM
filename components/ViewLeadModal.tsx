"use client";

import { useState } from "react";
import type { Lead } from "@/types";
import { useApp } from "@/app/context/AppContext";
import { useToast } from "@/app/context/ToastContext";
import { formatINR } from "@/lib/currency";
import { CallConfirmModal } from "@/components/CallConfirmModal";

interface ViewLeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onDelete?: () => void;
}

export function ViewLeadModal({ lead, onClose, onDelete }: ViewLeadModalProps) {
  const { leads, agents, updateLeadCost, updateLeadConvertedAmount, updateLeadPhone } = useApp();
  const { toast } = useToast();
  const [editingCost, setEditingCost] = useState(false);
  const [costInput, setCostInput] = useState("");
  const [editingAmountGot, setEditingAmountGot] = useState(false);
  const [amountGotInput, setAmountGotInput] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);

  if (!lead) return null;
  const latestLead = leads.find((l) => l.id === lead.id) ?? lead;
  const agent = latestLead.assignedAgentId
    ? agents.find((a) => a.id === latestLead.assignedAgentId)
    : null;

  const startEditCost = () => {
    setCostInput(String(latestLead.leadCost));
    setEditingCost(true);
  };

  const saveCost = () => {
    const num = parseInt(costInput, 10);
    if (!Number.isNaN(num) && num >= 0) {
      updateLeadCost(lead.id, num);
    }
    setEditingCost(false);
  };

  const startEditAmountGot = () => {
    setAmountGotInput(latestLead.convertedAmount != null ? String(latestLead.convertedAmount) : "");
    setEditingAmountGot(true);
  };

  const saveAmountGot = () => {
    const num = parseFloat(amountGotInput);
    if (!Number.isNaN(num) && num >= 0) {
      updateLeadConvertedAmount(latestLead.id, num);
    }
    setEditingAmountGot(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Lead Details</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{latestLead.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="flex items-center gap-2 font-medium text-slate-900">
              <span className="tabular-nums">{latestLead.phone || "—"}</span>
              {latestLead.phone && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowCallModal(true)}
                    className="rounded p-1.5 text-slate-500 hover:bg-primary-100 hover:text-primary-600"
                    title="Call"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(latestLead.phone); toast("Number copied"); }}
                    className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                    title="Copy number"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 0v8a2 2 0 01-2 2h-2m-4-4v4m0 0v-4m0-4h4" />
                    </svg>
                  </button>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Source</dt>
            <dd className="font-medium text-slate-900">{latestLead.source}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium text-slate-900">{latestLead.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Lead Cost (₹)</dt>
            <dd className="font-medium text-slate-900">
              {editingCost ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={saveCost}
                    className="text-primary-600 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCost(false)}
                    className="text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {formatINR(latestLead.leadCost)}
                  <button
                    type="button"
                    onClick={startEditCost}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Edit
                  </button>
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Assigned Agent</dt>
            <dd className="font-medium text-slate-900">{agent?.name ?? "—"}</dd>
          </div>
          {latestLead.status === "Converted" && (
            <>
              <div>
                <dt className="text-slate-500">Amount got (₹)</dt>
                <dd className="font-medium text-slate-900">
                  {editingAmountGot ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={amountGotInput}
                        onChange={(e) => setAmountGotInput(e.target.value)}
                        className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-slate-900"
                      />
                      <button type="button" onClick={saveAmountGot} className="text-primary-600 hover:underline">Save</button>
                      <button type="button" onClick={() => setEditingAmountGot(false)} className="text-slate-500 hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      {formatINR(latestLead.convertedAmount ?? 0)}
                      <button type="button" onClick={startEditAmountGot} className="text-xs text-primary-600 hover:underline">Edit</button>
                    </span>
                  )}
                </dd>
              </div>
              </>
          )}
          {(latestLead.paid != null || latestLead.due != null) && (
            <>
              <div>
                <dt className="text-slate-500">Paid</dt>
                <dd className="font-medium text-slate-900">{formatINR(latestLead.paid ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Due</dt>
                <dd className="font-medium text-slate-900">{formatINR(latestLead.due ?? 0)}</dd>
              </div>
            </>
          )}
        </dl>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete Lead
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
      {showCallModal && (
        <CallConfirmModal
          phone={latestLead.phone}
          leadName={latestLead.name}
          leadId={latestLead.id}
          onClose={() => setShowCallModal(false)}
          onUpdatePhone={updateLeadPhone}
        />
      )}
    </div>
  );
}
