import Link from "next/link";
import Image from "next/image";

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

export default function Home() {
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
              <p className="text-xs text-zinc-500">Bakery Management Software</p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-600 lg:flex">
            <a href="#features" className="hover:text-zinc-900">Bakery Features</a>
            <a href="#solutions" className="hover:text-zinc-900">Bakery Workflow</a>
            <a href="#about" className="hover:text-zinc-900">About GaGari</a>
            <a href="#contact" className="hover:text-zinc-900">Contact Bakery Support</a>
          </nav>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:px-6"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
              Bakery Management Software
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Run bakery orders, customers, and daily production from one simple system.
            </h1>
            <p className="max-w-2xl text-base text-zinc-600 sm:text-lg">
              GaGari helps bakeries manage custom cake orders, pastries, bread inventory, customer records,
              and staff workflows with a clean mobile-first dashboard made for busy bakery teams.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:w-auto"
              >
                Access Bakery Dashboard
              </Link>
              <a
                href="#contact"
                className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 sm:w-auto"
              >
                Request a Bakery Demo
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Image
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
              alt="Fresh artisan bread on a wooden table"
              width={900}
              height={560}
              priority
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 28vw"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:h-72"
            />
            <Image
              src="https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80"
              alt="Pastries displayed in a bakery showcase"
              width={900}
              height={560}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 28vw"
              className="h-56 w-full rounded-3xl object-cover shadow-lg sm:h-72"
            />
            <Image
              src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80"
              alt="Bakery staff preparing dough"
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
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bakery Management Features</h2>
              <p className="mt-2 text-zinc-600">Everything a bakery needs to take orders, serve customers, and stay organized.</p>
            </div>
            <p className="max-w-md text-sm text-zinc-500">
              Built for bakery owners, pastry shops, cake businesses, and front-desk staff who need quick,
              reliable workflows every day.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Bakery Order Management</h3>
              <p className="mt-2 text-sm text-zinc-600">Track cake orders, custom requests, pending pickups, and paid orders with clear status visibility.</p>
            </article>
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Customer Details for Repeat Orders</h3>
              <p className="mt-2 text-sm text-zinc-600">Keep customer names, phone numbers, and order history ready for quick reorder handling.</p>
            </article>
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Bakery Product Catalog</h3>
              <p className="mt-2 text-sm text-zinc-600">Manage bread, pastries, cakes, desserts, sizes, and pricing from one place.</p>
            </article>
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Bakery Staff Roles</h3>
              <p className="mt-2 text-sm text-zinc-600">Give owners, admins, cashiers, and bakery staff the right dashboard for their role.</p>
            </article>
          </div>
        </section>

        <section id="solutions" className="mx-auto mt-14 w-full max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Why Bakeries Choose GaGari</h2>
              <ul className="mt-4 grid gap-3 text-sm text-zinc-700 sm:text-base md:grid-cols-2">
                <li>Fast mobile order entry for busy bakery counters</li>
                <li>Clear desktop dashboards for bakery owners and managers</li>
                <li>Simple tools for staff who handle cakes, bread, and pastries</li>
                <li>Consistent workflow across phones, tablets, and computers</li>
                <li>Better customer service with organized order tracking</li>
                <li>Built for bakery daily operations and repeat customers</li>
              </ul>
            </div>
            <aside className="rounded-3xl border border-zinc-200 bg-zinc-900 p-6 text-zinc-100 shadow-sm">
              <p className="text-sm uppercase tracking-[0.14em] text-zinc-300">Bakery Workflow</p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                One system for bakery orders, products, customers, and staff.
              </p>
              <p className="mt-3 text-sm text-zinc-300">
                GaGari gives your bakery a clear structure without adding unnecessary complexity.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
              >
                Open Bakery Login
              </Link>
            </aside>
          </div>
        </section>

        <section id="about" className="mx-auto mt-14 w-full max-w-7xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">About GaGari</h2>
          <p className="mt-3 max-w-4xl text-zinc-600">
            GaGari is built for bakery businesses that want a practical way to manage orders, customers,
            products, and daily service. The experience stays easy for front-counter teams while still giving
            owners and managers the visibility they need.
          </p>
        </section>

        <section id="contact" className="mx-auto mt-14 w-full max-w-7xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contact Us</h2>
              <p className="mt-2 text-zinc-600">
                For bakery software demos, onboarding help, or questions about managing your bakery,
                reach out to our team.
              </p>
              <div className="mt-5 space-y-2 text-sm text-zinc-700">
                <p>Email: hello@gagari.com</p>
                <p>Phone: +251 900 000 000</p>
                <p>Address: Addis Ababa, Ethiopia</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <h3 className="text-lg font-semibold">Bakery Support Hours</h3>
              <p className="mt-2 text-sm text-zinc-600">Monday - Friday: 8:00 AM to 6:00 PM</p>
              <p className="text-sm text-zinc-600">Saturday: 9:00 AM to 2:00 PM</p>
              <p className="text-sm text-zinc-600">Sunday: Closed</p>
              <Link
                href="/login"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Bakery Team Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
          <div>
            <p className="text-lg font-semibold tracking-tight">GaGari</p>
            <p className="mt-2 text-sm text-zinc-600">
              Bakery management software for orders, customers, products, and staff workflows.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              <li><a href="#about" className="hover:text-zinc-900">About</a></li>
              <li><a href="#features" className="hover:text-zinc-900">Features</a></li>
              <li><a href="#contact" className="hover:text-zinc-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Access</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-700">
              <li><Link href="/login" className="hover:text-zinc-900">Login</Link></li>
              <li><a href="#solutions" className="hover:text-zinc-900">Bakery Use Cases</a></li>
              <li><a href="#contact" className="hover:text-zinc-900">Bakery Support</a></li>
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