import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import LanguageToggle from "@/components/language-toggle";
import { localeCookieName, resolveLocale } from "@/lib/locales";
import { getLandingCopy } from "@/lib/i18n/landing";

export const metadata = {
  title: "Bakery Management Software | GaGari",
  description:
    "Run your bakery with bakery management software for orders, customers, products, and staff workflows.",
  keywords: [
    "bakery management software",
    "bakery order management",
    "bakery POS",
    "bakery customer management",
    "bakery inventory and products",
    "bakery staff workflow",
  ],
};

export default async function Home() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const copy = getLandingCopy(locale);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#ffffff_35%,#f6f7f8_100%)] text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/Gagari_Logo.png"
              alt="GaGari Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <p className="text-base font-semibold tracking-tight">GaGari</p>
              <p className="text-xs text-zinc-500">{copy.brandTag}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-600 lg:flex">
            <a href="#features" className="hover:text-zinc-900">{copy.nav.features}</a>
            <a href="#solutions" className="hover:text-zinc-900">{copy.nav.solutions}</a>
            <a href="#about" className="hover:text-zinc-900">{copy.nav.about}</a>
            <a href="#contact" className="hover:text-zinc-900">{copy.nav.contact}</a>
          </nav>

          <div className="hidden sm:block">
            <LanguageToggle locale={locale} />
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:px-6"
          >
            {copy.login}
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
              {copy.hero.eyebrow}
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {copy.hero.title}
            </h1>
            <p className="max-w-2xl text-base text-zinc-600 sm:text-lg">
              {copy.hero.description}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:w-auto"
              >
                {copy.hero.primaryCta}
              </Link>
              <a
                href="#contact"
                className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 sm:w-auto"
              >
                {copy.hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Image
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
              alt={copy.images.first}
              width={900}
              height={560}
              priority
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 28vw"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:h-72"
            />
            <Image
              src="https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80"
              alt={copy.images.second}
              width={900}
              height={560}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 28vw"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:h-72"
            />
            <Image
              src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80"
              alt={copy.images.third}
              width={900}
              height={560}
              sizes="(max-width: 1023px) 100vw, 45vw"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:col-span-2 sm:h-72"
            />
          </div>
        </section>

        <section id="features" className="mx-auto mt-14 w-full max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.features.title}</h2>
              <p className="mt-2 text-zinc-600">{copy.features.description}</p>
            </div>
            <p className="max-w-md text-sm text-zinc-500">{copy.features.sideNote}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.features.cards.map((card) => (
              <article key={card.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="solutions" className="mx-auto mt-14 w-full max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy.solutions.title}</h2>
              <ul className="mt-4 grid gap-3 text-sm text-zinc-700 sm:text-base md:grid-cols-2">
                {copy.solutions.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            <aside className="rounded-3xl border border-zinc-200 bg-zinc-900 p-6 text-zinc-100 shadow-sm">
              <p className="text-sm uppercase tracking-[0.14em] text-zinc-300">{copy.solutions.panelLabel}</p>
              <p className="mt-3 text-2xl font-semibold leading-tight">{copy.solutions.panelTitle}</p>
              <p className="mt-3 text-sm text-zinc-300">{copy.solutions.panelDescription}</p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
              >
                {copy.solutions.panelCta}
              </Link>
            </aside>
          </div>
        </section>

        <section id="about" className="mx-auto mt-14 w-full max-w-7xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy.about.title}</h2>
          <p className="mt-3 max-w-4xl text-zinc-600">{copy.about.description}</p>
        </section>

        <section id="contact" className="mx-auto mt-14 w-full max-w-7xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy.contact.title}</h2>
              <p className="mt-2 text-zinc-600">{copy.contact.description}</p>
              <div className="mt-5 space-y-2 text-sm text-zinc-700">
                {copy.contact.details.map((detail) => (
                  <p key={detail}>{detail}</p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <h3 className="text-lg font-semibold">{copy.contact.supportHoursTitle}</h3>
              {copy.contact.supportHours.map((hours) => (
                <p key={hours} className="text-sm text-zinc-600">{hours}</p>
              ))}
              <Link
                href="/login"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                {copy.contact.supportCta}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
          <div>
            <p className="text-lg font-semibold tracking-tight">GaGari</p>
            <p className="mt-2 text-sm text-zinc-600">{copy.footer.description}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">{copy.footer.company}</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              <li><a href="#about" className="hover:text-zinc-900">{copy.footer.links.about}</a></li>
              <li><a href="#features" className="hover:text-zinc-900">{copy.footer.links.features}</a></li>
              <li><a href="#contact" className="hover:text-zinc-900">{copy.footer.links.contact}</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">{copy.footer.access}</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              <li><Link href="/login" className="hover:text-zinc-900">{copy.footer.links.login}</Link></li>
              <li><a href="#solutions" className="hover:text-zinc-900">{copy.footer.links.useCases}</a></li>
              <li><a href="#contact" className="hover:text-zinc-900">{copy.footer.links.support}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-200 px-4 py-4 text-center text-xs text-zinc-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} GaGari. All rights reserved.
        </div>
      </footer>
    </div>
  );
}