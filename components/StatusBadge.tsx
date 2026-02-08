"use client";

import type { LeadStatus } from "@/types";

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-blue-50 text-blue-700 border-blue-200",
  Interested: "bg-amber-50 text-amber-800 border-amber-200",
  "Follow-up": "bg-violet-50 text-violet-700 border-violet-200",
  Converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
