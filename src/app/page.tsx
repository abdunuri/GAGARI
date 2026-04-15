import FeatureCard from "@/components/dashboard/featureCard"
import SignOutButton from "@/components/dashboard/SignOutButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Gagari Dashboard</h1>
          <p className="max-w-2xl text-lg text-zinc-600">
            Manage customers, items, and orders from one place.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a href="/customers"><FeatureCard title="Customer" description="View customer records and track who is placing orders."/></a>
          <FeatureCard title="Items" description="Manage your products, pricing, and availability."/>
          <a href="/orders"><FeatureCard title="Orders" description="Create orders and review order history in one workflow."/></a>
          <a href="/dashboard"><FeatureCard title="Dashboard" description="the main dashboard am protecting with authclient."/></a>
        </div>

        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6">
          <h2 className="text-xl font-semibold">Next step</h2>
          <p className="mt-2 text-zinc-600">
            We’ll turn these sections into real pages and connect them to your services.
            <SignOutButton />
          </p>
        </div>
      </section>
    </main>
  );
}