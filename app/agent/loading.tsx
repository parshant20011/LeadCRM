export default function AgentLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-36 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-slate-200" />
    </div>
  );
}
