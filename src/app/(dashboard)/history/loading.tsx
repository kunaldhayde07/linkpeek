export default function HistoryLoading() {
  return (
    <div>
      <div className="mb-6"><div className="h-7 w-40 animate-pulse rounded bg-muted" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="h-32 w-48 flex-shrink-0 animate-pulse bg-muted" />
            <div className="flex-1 space-y-2 p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
