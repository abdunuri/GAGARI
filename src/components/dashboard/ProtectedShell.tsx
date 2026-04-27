import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/dashboard/SignOutButton";
import { GetBakeryById } from "@/services/bakery.service";
import { cookies } from "next/headers";
import LanguageToggle from "@/components/language-toggle";
import { localeCookieName, resolveLocale } from "@/lib/locales";
import { getShellCopy } from "@/lib/i18n/shell";

type Bakery = Awaited<ReturnType<typeof GetBakeryById>>;
export default async function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const chrome = getShellCopy(locale);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-4 lg:px-8 lg:py-3">
          <div className="flex items-start justify-between gap-3 lg:items-center lg:justify-start">
            <div className="space-y-1">
              <Link href="/" className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-xl">
                {await GetBakeryById(Number(session.user.bakeryId))?.then((bakery: Bakery) => bakery?.name) || "Bakery Dashboard"} Bakery
              </Link>
              <p className="max-w-sm text-xs text-zinc-500 sm:text-sm lg:max-w-none lg:text-xs">{chrome.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <LanguageToggle locale={locale} />
              <SignOutButton label={chrome.signOut} />
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm text-zinc-600 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center lg:overflow-visible lg:pb-0">
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white lg:px-4 lg:py-1.5"
            >
              {chrome.nav.dashboard}
            </Link>
            <Link
              href="/customers"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white lg:px-4 lg:py-1.5"
            >
              {chrome.nav.customers}
            </Link>
            <Link
              href="/products"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white lg:px-4 lg:py-1.5"
            >
              {chrome.nav.products}
            </Link>
            <Link
              href="/orders"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white lg:px-4 lg:py-1.5"
            >
              {chrome.nav.orders}
            </Link>
            <Link
              href="/orders/new"
              className="shrink-0 rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-zinc-700 lg:px-4 lg:py-1.5"
            >
              {chrome.nav.newOrder}
            </Link>
          </nav>

          <div className="hidden items-center justify-end gap-3 lg:flex">
            <LanguageToggle locale={locale} />
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-zinc-900">{session.user.name}</span>
              <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">{session.user.role}</span>
            </div>
            <SignOutButton label={chrome.signOut} />
          </div>

        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
