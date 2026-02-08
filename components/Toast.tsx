"use client";

import { useToast as useToastState } from "@/app/context/ToastContext";
import type { ToastType } from "@/app/context/ToastContext";

const styles: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-primary-50 border-primary-200 text-primary-800",
};

const icons: Record<ToastType, string> = {
  success: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a1 1 0 00-1.414-1.414L9 10.586 7.557 9.143a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
  error: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
  info: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z",
};

export function ToastContainer() {
  const { toasts } = useToastState();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all ${styles[t.type]}`}
        >
          <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d={icons[t.type]} clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
