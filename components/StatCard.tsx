interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
  /** Optional: override icon container color (e.g. "bg-amber-100 text-amber-600") */
  iconClassName?: string;
}

export function StatCard({ title, value, sub, trend, trendLabel, icon, valueClassName, iconClassName }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-2 text-2xl font-bold tabular-nums ${valueClassName ?? "text-slate-900"}`}>{value}</p>
          {(sub ?? trendLabel) && (
            <div className="mt-1 flex items-center gap-2">
              {trend && trend !== "neutral" && (
                <span
                  className={`inline-flex items-center text-xs font-medium ${
                    trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {trend === "up" ? (
                    <svg className="mr-0.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="mr-0.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {trendLabel}
                </span>
              )}
              {sub && <span className="text-xs text-slate-400">{sub}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`shrink-0 rounded-xl p-2.5 ${iconClassName ?? "bg-primary-50 text-primary-600"}`}>{icon}</div>
        )}
      </div>
    </div>
  );
}
