"use client";

import { useState, useEffect } from "react";

/** Returns true if string contains any non-digit (except + at start) */
function hasNonDigits(s: string): boolean {
  const trimmed = (s || "").trim();
  if (!trimmed) return true;
  const digitsOnly = trimmed.replace(/^\+/, "").replace(/\D/g, "");
  return digitsOnly.length !== trimmed.replace(/^\+/, "").length;
}

interface CallConfirmModalProps {
  phone: string;
  leadName?: string;
  leadId?: string;
  onClose: () => void;
  onUpdatePhone?: (leadId: string, phone: string) => void;
}

export function CallConfirmModal({
  phone,
  leadName,
  leadId,
  onClose,
  onUpdatePhone,
}: CallConfirmModalProps) {
  const [editNumber, setEditNumber] = useState(phone);
  const [showEdit, setShowEdit] = useState(false);
  const [updateLeadPhone, setUpdateLeadPhone] = useState(false);

  const shouldOfferEdit = hasNonDigits(phone);
  const displayNumber = showEdit ? editNumber : phone;
  const canCall = (showEdit ? editNumber : phone).trim().length > 0;

  useEffect(() => {
    setEditNumber(phone);
    setShowEdit(shouldOfferEdit);
  }, [phone, shouldOfferEdit]);

  const handleEditToggle = () => setShowEdit((prev) => !prev);

  const handleConfirmCall = () => {
    const num = (showEdit ? editNumber : phone).trim();
    if (!num) return;
    if (updateLeadPhone && leadId && onUpdatePhone) {
      onUpdatePhone(leadId, num);
    }
    window.location.href = `tel:${num}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Confirm Call</h2>
        {leadName && (
          <p className="mt-1 text-sm text-slate-500">Lead: {leadName}</p>
        )}
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500">Number to call</p>
          {showEdit ? (
            <div className="mt-2 space-y-2">
              <input
                type="tel"
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                autoFocus
              />
              {leadId && onUpdatePhone && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={updateLeadPhone}
                    onChange={(e) => setUpdateLeadPhone(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/20"
                  />
                  Update lead&apos;s phone number
                </label>
              )}
            </div>
          ) : (
            <p className="mt-1 font-medium tabular-nums text-slate-900">{displayNumber}</p>
          )}
          {!showEdit && (
            <button
              type="button"
              onClick={handleEditToggle}
              className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {shouldOfferEdit ? "Edit number (contains special characters)" : "Edit number"}
            </button>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmCall}
            disabled={!canCall}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Call
          </button>
        </div>
      </div>
    </div>
  );
}
