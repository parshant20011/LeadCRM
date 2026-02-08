"use client";

import { useState } from "react";
import { useApp } from "@/app/context/AppContext";

const SOURCE_OPTIONS = ["Website", "Referral", "Facebook", "Google Ads", "Cold Call", "LinkedIn", "Event"];

interface AddLeadSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddLeadSheet({ open, onClose, onSuccess }: AddLeadSheetProps) {
  const { addLead, agents, defaultLeadCost } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [leadCost, setLeadCost] = useState(defaultLeadCost);
  const [assignedAgentId, setAssignedAgentId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    addLead({
      name: name.trim(),
      phone: phone.trim(),
      source: source.trim(),
      leadCost: Math.max(0, leadCost),
      assignedAgentId: assignedAgentId || null,
    });
    setName("");
    setPhone("");
    setSource(SOURCE_OPTIONS[0]);
    setLeadCost(defaultLeadCost);
    setAssignedAgentId("");
    onClose();
    onSuccess?.();
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setSource(SOURCE_OPTIONS[0]);
    setLeadCost(defaultLeadCost);
    setAssignedAgentId("");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        role="dialog"
        aria-labelledby="add-lead-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="add-lead-title" className="text-lg font-semibold text-slate-900">
            Add Lead
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 px-6 py-6">
            <div>
              <label htmlFor="add-lead-name" className="block text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="add-lead-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            <div>
              <label htmlFor="add-lead-phone" className="block text-sm font-medium text-slate-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="add-lead-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div>
              <label htmlFor="add-lead-source" className="block text-sm font-medium text-slate-700">
                Source
              </label>
              <select
                id="add-lead-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-lead-cost" className="block text-sm font-medium text-slate-700">
                Lead cost (₹)
              </label>
              <input
                id="add-lead-cost"
                type="number"
                min={0}
                value={leadCost}
                onChange={(e) => setLeadCost(parseInt(e.target.value, 10) || 0)}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="add-lead-agent" className="block text-sm font-medium text-slate-700">
                Assign to agent (optional)
              </label>
              <select
                id="add-lead-agent"
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-auto border-t border-slate-200 px-6 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                Add Lead
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
