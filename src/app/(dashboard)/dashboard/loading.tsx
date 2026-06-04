export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-7 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-9 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
