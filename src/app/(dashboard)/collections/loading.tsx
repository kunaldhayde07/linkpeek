export default function CollectionsLoading() {
  return (
    <div>
      <div className="mb-6"><div className="h-7 w-36 animate-pulse rounded bg-muted" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-1">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
