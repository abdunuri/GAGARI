import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const roleCopy = {
    SYSTEM_ADMIN: {
        title: "System Admin Dashboard",
        description: "Manage platform-wide settings, bakeries, and privileged accounts.",
        accent: "from-violet-500 to-indigo-600",
        actions: [
            { label: "New order", href: "/orders/new" },
            { label: "Manage customers", href: "/customers" },
            { label: "Review orders", href: "/orders" },
            { label: "Add products", href: "/products" },
        ],
    },
    ADMIN: {
        title: "Admin Dashboard",
        description: "Oversee the bakery, manage staff workflows, and monitor activity.",
        accent: "from-emerald-500 to-teal-500",
        actions: [
            { label: "New order", href: "/orders/new" },
            { label: "Manage customers", href: "/customers" },
            { label: "Review orders", href: "/orders" },
            { label: "Add products", href: "/products" },
        ],
    },
    OWNER: {
        title: "Owner Dashboard",
        description: "Track the full bakery business with a quick view of operations.",
        accent: "from-sky-500 to-cyan-500",
        actions: [
            { label: "New order", href: "/orders/new" },
            { label: "Manage inventory", href: "/products" },
            { label: "View customers", href: "/customers" },
        ],
    },
    STAFF: {
        title: "Staff Dashboard",
        description: "Handle daily order processing and customer support tasks.",
        accent: "from-amber-500 to-orange-500",
        actions: [
            { label: "New order", href: "/orders/new" },
            { label: "Open orders", href: "/orders" },
            { label: "Customers", href: "/customers" },
        ],
    },
    VIEWER: {
        title: "Viewer Dashboard",
        description: "Read-only access to bakery activity and operational summaries.",
        accent: "from-zinc-500 to-zinc-700",
        actions: [
            { label: "New order", href: "/orders/new" },
            { label: "Browse orders", href: "/orders" },
            { label: "Browse products", href: "/products" },
            { label: "Customers", href: "/customers" },
        ],
    },
} as const;

export default async function Dashboard(){
    let session = null
    try {
        session = await auth.api.getSession({
            headers:await headers()
        })
    } catch {
        session = null
    }

    if(!session){
        redirect(process.env["BETTER_AUTH_URL"] ? `${process.env["BETTER_AUTH_URL"]}/login` : "/login");
    }
    const role = session.user.role as keyof typeof roleCopy;
    if (role === "SYSTEM_ADMIN") {
        redirect("/Admin");
    }

    const bakeryId = Number(session.user.bakeryId);
    if (Number.isNaN(bakeryId)) {
        redirect(process.env["BETTER_AUTH_URL"] ? `${process.env["BETTER_AUTH_URL"]}/login` : "/login");
    }

    const dashboard = roleCopy[role] ?? roleCopy.STAFF;
    const showStats = role === "ADMIN" || role === "OWNER";
    let recentOrders =  await prisma.order.findMany({
            where: { bakeryId },
            include: { customer: true, orderProducts: true },
            orderBy: { createdAt: "desc" },
            take: 5,
        })
    const [customerCount, productCount, orderCount, pendingCount] = await Promise.all([
        prisma.customer.count({ where: { bakeryId } }),
        prisma.product.count({ where: { bakeryId } }),
        prisma.order.count({ where: { bakeryId } }),
        prisma.order.count({ where: { bakeryId, status: "PENDING" } }),
    ]);

    if(session.user.role !== "SYSTEM_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
        recentOrders = recentOrders.filter(order => order.createdById === session.user.id);
    }
        


    const stats = [
        { label: "Customers", value: customerCount, hint: "Active bakery customers" },
        { label: "Products", value: productCount, hint: "Catalog entries" },
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
                                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                    <a
                                        href="/orders/new"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:w-auto"
                                    >
                                        New Order
                                    </a>
                                    <a
                                        href="/orders"
                                        className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 sm:w-auto"
                                    >
                                        View Orders
                                    </a>
                                </div>
                            </div>

                            {showStats && (
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                                            <p className="text-sm text-zinc-500">{stat.label}</p>
                                            <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</p>
                                            <p className="mt-1 text-xs text-zinc-500">{stat.hint}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    className={action.href === "/orders/new"
                                        ? "rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800"
                                        : "rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white"
                                    }
                                >
                                    <p className={action.href === "/orders/new" ? "text-sm font-semibold text-white" : "text-sm font-medium text-zinc-900"}>{action.label}</p>
                                    <p className={action.href === "/orders/new" ? "mt-2 text-sm text-zinc-200" : "mt-2 text-sm text-zinc-500"}>
                                        {action.href === "/orders/new" ? "Start a new order immediately." : "Open the workflow for this task."}
                                    </p>
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
                                            <p className="text-sm text-zinc-500">{order.customer?.name ?? "Unknown"}</p>
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
                            ))}                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}