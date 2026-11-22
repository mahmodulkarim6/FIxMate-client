export default function Loading() {
  return (
    <div className="shell flex min-h-svh flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-secondary" />
            <div className="h-8 w-64 animate-pulse rounded-lg bg-secondary" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-full bg-secondary" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading FixMate…</span>
    </div>
  );
}
