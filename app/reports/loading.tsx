export default function ReportsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-28 rounded-lg bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
