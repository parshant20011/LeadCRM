"use client";

import type { Lead } from "@/types";

interface PhoneActionsProps {
  lead: Lead;
  onCallClick: (lead: Lead) => void;
  onCopy: (phone: string) => void;
}

export function PhoneActions({ lead, onCallClick, onCopy }: PhoneActionsProps) {
  const phone = lead.phone || "";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      navigator.clipboard.writeText(phone);
      onCopy(phone);
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) onCallClick(lead);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="tabular-nums text-slate-700">{phone || "—"}</span>
      {phone && (
        <span className="ml-1.5 flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={handleCall}
            className="rounded p-1.5 text-slate-500 transition hover:bg-primary-100 hover:text-primary-600"
            title="Call"
            aria-label="Call"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            title="Copy number"
            aria-label="Copy number"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 0v8a2 2 0 01-2 2h-2m-4-4v4m0 0v-4m0-4h4" />
            </svg>
          </button>
        </span>
      )}
    </div>
  );
}
