"use client";

import { useState, useEffect } from "react";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center border-b border-slate-200 px-3">
          <div className="h-9 w-9 rounded-lg bg-slate-200 animate-pulse" />
          <div className="ml-2 h-5 w-32 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="mt-4 space-y-2 px-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
      {/* Main area */}
      <div className="lg:ml-64 flex-1">
        <div className="h-14 border-b border-slate-200 bg-white" />
        <div className="p-6 space-y-6">
          <div className="h-8 w-48 rounded-lg bg-slate-200 animate-pulse" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ClientHydrationGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
