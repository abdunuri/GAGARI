import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/dashboard/SignOutButton";

export default async function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Link href="/" className="text-xl font-semibold tracking-tight sm:text-2xl">
                GaGari
              </Link>
              <p className="text-xs text-zinc-500 sm:text-sm">
                Bakery operations built for mobile-first teams.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-sm sm:flex-row sm:items-center">
              <span className="max-w-[11rem] rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-right font-medium text-zinc-700 sm:max-w-none">
                {session.user.name} · {session.user.role}
              </span>
              <SignOutButton />
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm text-zinc-600 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/customers"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              Customers
            </Link>
            <Link
              href="/items"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              Items
            </Link>
            <Link
              href="/orders"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              Orders
            </Link>
            <Link
              href="/orders/new"
              className="shrink-0 rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-zinc-700"
            >
              New Order
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
