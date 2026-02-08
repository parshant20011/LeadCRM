"use client";

import { useState } from "react";
import type { Lead } from "@/types";

interface ConvertedAmountModalProps {
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function ConvertedAmountModal({ lead, onClose, onConfirm }: ConvertedAmountModalProps) {
  const [amount, setAmount] = useState(lead?.convertedAmount != null ? String(lead.convertedAmount) : "");

  if (!lead) return null;

  const handleConfirm = () => {
    const num = parseFloat(amount);
    if (!Number.isNaN(num) && num >= 0) {
      onConfirm(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Amount received</h2>
        <p className="mt-1 text-sm text-slate-500">
          Lead &quot;{lead.name}&quot; is being marked as Converted. Enter the amount received (₹).
        </p>
        <div className="mt-4">
          <label htmlFor="converted-amount" className="mb-1 block text-xs font-medium text-slate-500">
            Amount got (₹)
          </label>
          <input
            id="converted-amount"
            type="number"
            min={0}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="0"
            autoFocus
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={amount === "" || Number.isNaN(parseFloat(amount)) || parseFloat(amount) < 0}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
