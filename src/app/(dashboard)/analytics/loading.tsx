export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-32 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4"><div className="h-12 animate-pulse rounded bg-muted" /></div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5"><div className="h-40 animate-pulse rounded bg-muted" /></div>
    </div>
  );
}
