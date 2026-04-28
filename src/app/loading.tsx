export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
        <div className="h-40 animate-pulse rounded-3xl border border-zinc-200 bg-white shadow-sm" />
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr] lg:gap-6">
          <div className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="h-6 w-40 animate-pulse rounded-full bg-zinc-200" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
            </div>
          </div>
          <div className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="h-6 w-36 animate-pulse rounded-full bg-zinc-200" />
            <div className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </section>
    </main>
  );
}
