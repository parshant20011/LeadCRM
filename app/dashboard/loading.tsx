export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
