import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const roleCopy = {
    ADMIN: {
        title: "Admin Dashboard",
        description: "Oversee the bakery, manage staff workflows, and monitor activity.",
        accent: "from-emerald-500 to-teal-500",
        actions: [
            { label: "Manage customers", href: "/customers" },
            { label: "Review orders", href: "/orders" },
            { label: "Add items", href: "/items" },
        ],
    },
    OWNER: {
        title: "Owner Dashboard",
        description: "Track the full bakery business with a quick view of operations.",
        accent: "from-sky-500 to-cyan-500",
        actions: [
            { label: "Create order", href: "/orders/new" },
            { label: "Manage inventory", href: "/items" },
            { label: "View customers", href: "/customers" },
        ],
    },
    STAFF: {
        title: "Staff Dashboard",
        description: "Handle daily order processing and customer support tasks.",
        accent: "from-amber-500 to-orange-500",
        actions: [
            { label: "Open orders", href: "/orders" },
            { label: "New order", href: "/orders/new" },
            { label: "Customers", href: "/customers" },
        ],
    },
    VIEWER: {
        title: "Viewer Dashboard",
        description: "Read-only access to bakery activity and operational summaries.",
        accent: "from-zinc-500 to-zinc-700",
        actions: [
            { label: "Browse orders", href: "/orders" },
            { label: "Browse items", href: "/items" },
            { label: "Customers", href: "/customers" },
        ],
    },
} as const;

export default async function Dashboard(){
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        redirect(`${process.env["BETTER_AUTH_URL"]}/login`);
    }
    const bakeryId = Number(session.user.bakeryId);
    const role = session.user.role as keyof typeof roleCopy;
    const dashboard = roleCopy[role] ?? roleCopy.STAFF;

    const [customerCount, itemCount, orderCount, pendingCount, recentOrders] = await Promise.all([
        prisma.customer.count({ where: { bakeryId } }),
        prisma.item.count({ where: { bakeryId } }),
        prisma.order.count({ where: { bakeryId } }),
        prisma.order.count({ where: { bakeryId, status: "PENDING" } }),
        prisma.order.findMany({
            where: { bakeryId },
            include: { customer: true, orderItems: true },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
    ]);

    const stats = [
        { label: "Customers", value: customerCount, hint: "Active bakery customers" },
        { label: "Items", value: itemCount, hint: "Catalog entries" },
        { label: "Orders", value: orderCount, hint: "All orders" },
        { label: "Pending", value: pendingCount, hint: "Needs attention" },
    ];

    return(
        <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
            <section className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
                <div className={`rounded-3xl bg-gradient-to-r ${dashboard.accent} p-[1px] shadow-lg`}>
                    <div className="rounded-3xl bg-white/95 p-5 backdrop-blur sm:p-6 lg:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-3">
                                <span className="inline-flex w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                                    {session.user.role}
                                </span>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{dashboard.title}</h1>
                                <p className="max-w-2xl text-sm text-zinc-600 sm:text-base lg:text-lg">{dashboard.description}</p>
                                <p className="text-sm text-zinc-500">
                                    Signed in as <span className="font-medium text-zinc-800">{session.user.name}</span>
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <p className="text-sm text-zinc-500">{stat.label}</p>
                                        <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</p>
                                        <p className="mt-1 text-xs text-zinc-500">{stat.hint}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr] lg:gap-6">
                    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold sm:text-xl">Quick actions</h2>
                                <p className="text-sm text-zinc-500">Common tasks for your role.</p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {dashboard.actions.map((action) => (
                                <a
                                    key={action.href}
                                    href={action.href}
                                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white"
                                >
                                    <p className="text-sm font-medium text-zinc-900">{action.label}</p>
                                    <p className="mt-2 text-sm text-zinc-500">Open the workflow for this task.</p>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold sm:text-xl">Recent orders</h2>
                                <p className="text-sm text-zinc-500">Latest activity in this bakery.</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-zinc-900">#{order.id.slice(0, 8)}</p>
                                            <p className="text-sm text-zinc-500">{order.customer.name}</p>
                                        </div>
                                        <span
                                            className={
                                                order.status === "PAID"
                                                    ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                                                    : order.status === "PENDING"
                                                        ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                                                        : "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                                            }
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Created on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}