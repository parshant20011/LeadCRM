"use client";

import { useApp } from "@/app/context/AppContext";
import { useToast } from "@/app/context/ToastContext";
import type { Lead } from "@/types";

interface AssignModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function AssignModal({ lead, onClose }: AssignModalProps) {
  const { agents, assignLead } = useApp();
  const { toast } = useToast();
  if (!lead) return null;

  const handleAssign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const agentId = (form.elements.namedItem("agent") as HTMLSelectElement)?.value;
    if (agentId) {
      const agentName = agents.find((a) => a.id === agentId)?.name ?? "Agent";
      assignLead(lead.id, agentId, lead.createdAt);
      toast(`Assigned ${lead.name} to ${agentName}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Assign Lead</h2>
        <p className="mt-1 text-sm text-slate-600">{lead.name}</p>
        <form onSubmit={handleAssign} className="mt-4 space-y-4">
          <div>
            <label htmlFor="agent" className="block text-sm font-medium text-slate-700">
              Agent
            </label>
            <select
              id="agent"
              name="agent"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
