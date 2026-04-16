import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#ffffff_50%,_#f5f5f4_100%)] px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 sm:gap-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 sm:space-y-6">
            <span className="inline-flex w-fit rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
              Built For Modern Bakeries
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Gagari helps your bakery run faster, cleaner, and smarter.
            </h1>
            <p className="max-w-2xl text-base text-zinc-600 sm:text-lg">
              One place to manage customers, menu items, daily orders, and team workflow.
              From walk-ins to bulk requests, Gagari keeps service moving while giving you
              clear visibility over your bakery operations.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/login" className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 sm:w-auto">
                Sign In
              </Link>
              <Link href="/signup" className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:border-zinc-400 sm:w-auto">
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
              alt="Fresh artisan bread on a wooden table"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:h-72"
            />
            <img
              src="https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80"
              alt="Pastries displayed in a bakery showcase"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:h-72"
            />
            <img
              src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80"
              alt="Bakery staff preparing dough"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:col-span-2 sm:h-72"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Order Workflow</h2>
            <p className="mt-2 text-zinc-600">
              Create, track, and update order status in seconds. Keep front desk and kitchen in sync.
            </p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Customer Management</h2>
            <p className="mt-2 text-zinc-600">
              Maintain customer records, contact details, and order history for better service.
            </p>
          </article>
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Inventory Visibility</h2>
            <p className="mt-2 text-zinc-600">
              Keep your item catalog and pricing consistent across your team.
            </p>
          </article>
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What Gagari Offers</h2>
          <ul className="mt-4 grid gap-3 text-sm text-zinc-700 sm:text-base md:grid-cols-2">
            <li>Real-time order list with clear status transitions</li>
            <li>Role-aware dashboard experience for owners and staff</li>
            <li>Quick customer lookups for repeat orders</li>
            <li>Centralized menu and pricing management</li>
          </ul>
        </section>
      </section>
    </main>
  );
}