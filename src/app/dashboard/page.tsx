import Link from "next/link";
import { getCurrentSession } from "@/lib/auth-session";
import { CACHE_TAGS, readThroughCache } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma"
import StaffBulkOrdersModal from "@/components/dashboard/StaffBulkOrdersModal";
import TelegramSettingsForm from "@/components/dashboard/TelegramSettingsForm";
import { cookies } from "next/headers"
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation"
import { getDashboardCopy, getRoleCopy } from "@/lib/i18n/dashboard";
import { localeCookieName, localeToIntl, resolveLocale } from "@/lib/locales";
import { getTelegramSettingsForOwner } from "@/services/telegram-settings.service";

const queryDashboardData = async (bakeryId: number, userId: string, canManageAnyOrder: boolean) => {
    const [recentOrdersRaw, counts, latestBulkBatchRaw] = await Promise.all([
        prisma.order.findMany({
            where: { bakeryId },
            select: {
                id: true,
                createdAt: true,
                createdById: true,
                status: true,
                customer: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        Promise.all([
            prisma.customer.count({ where: { bakeryId } }),
            prisma.product.count({ where: { bakeryId } }),
            prisma.order.count({ where: { bakeryId } }),
            prisma.order.count({ where: { bakeryId, status: "PENDING" } }),
        ]),
        prisma.order.findFirst({
            where: {
                bakeryId,
                bulkBatchId: {
                    not: null,
                },
                ...(canManageAnyOrder
                    ? {}
                    : {
                        createdById: userId,
                    }),
            },
            select: {
                bulkBatchId: true,
                createdAt: true,
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],
        }),
    ]);

    const latestBulkOrdersRaw = latestBulkBatchRaw?.bulkBatchId
        ? await prisma.order.findMany({
            where: {
                bakeryId,
                bulkBatchId: latestBulkBatchRaw.bulkBatchId,
                ...(canManageAnyOrder
                    ? {}
                    : {
                        createdById: userId,
                    }),
            },
            select: {
                id: true,
                status: true,
                customer: {
                    select: {
                        name: true,
                    },
                },
                orderProducts: {
                    select: {
                        unitPrice: true,
                        quantity: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],
        })
        : [];

    const [customerCount, productCount, orderCount, pendingCount] = counts;

    return {
        customerCount,
        productCount,
        orderCount,
        pendingCount,
        recentOrders: recentOrdersRaw.map((order) => ({
            ...order,
            createdAt: order.createdAt.toISOString(),
        })),
        latestBulkBatch: latestBulkBatchRaw
            ? {
                ...latestBulkBatchRaw,
                createdAt: latestBulkBatchRaw.createdAt.toISOString(),
            }
            : null,
        latestBulkOrders: latestBulkOrdersRaw.map((order) => ({
            ...order,
            orderProducts: order.orderProducts.map((product) => ({
                ...product,
                unitPrice: Number(product.unitPrice),
            })),
        })),
    };
};

const getCachedDashboardData = unstable_cache(
    queryDashboardData,
    ["dashboard-data"],
    {
        tags: [CACHE_TAGS.dashboard, CACHE_TAGS.orders, CACHE_TAGS.customers, CACHE_TAGS.products],
        revalidate: 30,
    }
);

export default async function Dashboard(){
    const cookieStore = await cookies();
    const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
    const copy = getDashboardCopy(locale);
    const roleCopy = getRoleCopy(locale);
    const localeDate = localeToIntl(locale);

    const session = await getCurrentSession();

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
    const canCreateOrder = role !== "VIEWER";
    const canManageAnyOrder = role === "ADMIN" || role === "OWNER";
    const dashboardData = await readThroughCache(
        () => getCachedDashboardData(bakeryId, session.user.id, canManageAnyOrder),
        () => queryDashboardData(bakeryId, session.user.id, canManageAnyOrder)
    );
    const telegramSettings = role === "OWNER" ? await getTelegramSettingsForOwner() : null;
    let recentOrders = dashboardData.recentOrders;
    const { customerCount, productCount, orderCount, pendingCount, latestBulkBatch, latestBulkOrders } = dashboardData;

    if(session.user.role !== "SYSTEM_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
        recentOrders = recentOrders.filter(order => order.createdById === session.user.id);
    }

    const latestBulkGroup = latestBulkBatch?.bulkBatchId
        ? (() => {
            const orders = latestBulkOrders.map((order) => {
                const total = order.orderProducts.reduce(
                    (sum, product) => sum + Number(product.unitPrice) * product.quantity,
                    0
                );

                return {
                    id: order.id,
                    customerName: order.customer.name,
                    total,
                    status: order.status,
                    quantity: order.orderProducts.reduce((sum, product) => sum + product.quantity, 0),
                    items: order.orderProducts.map((product) => ({
                        id: product.product.id,
                        name: product.product.name,
                        quantity: product.quantity,
                        unitPrice: Number(product.unitPrice),
                    })),
                };
            });

            const total = orders.reduce((sum, order) => sum + order.total, 0);
            const uniqueStatuses = Array.from(new Set(orders.map((order) => order.status)));
            const status = (uniqueStatuses.length === 1 ? uniqueStatuses[0] : "MIXED") as "PENDING" | "PAID" | "CANCELLED" | "MIXED";
            const dayLabel = new Intl.DateTimeFormat(localeDate, { weekday: "long" }).format(new Date(latestBulkBatch.createdAt));

            return {
                id: `bulk:${latestBulkBatch.bulkBatchId}`,
                isBulk: true,
                title: `${copy.bulk.titlePrefix} (${orders.length} ${copy.bulk.titleSuffix}) • ${dayLabel}`,
                total,
                status,
                orders,
            };
        })()
        : null;
        


    const statValueMap = {
        customers: customerCount,
        products: productCount,
        orders: orderCount,
        pending: pendingCount,
    } satisfies Record<(typeof copy.stats)[number]["key"], number>;

    const stats = copy.stats.map((stat) => ({
        ...stat,
        value: statValueMap[stat.key] ?? 0,
    }));

    return(
        <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
            <section className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6">
                <div className={`rounded-3xl bg-gradient-to-r ${dashboard.accent} p-[1px] shadow-lg`}>
                    <div className="rounded-3xl bg-white/95 p-5 backdrop-blur sm:p-6 lg:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-3">
                                <span className="inline-flex w-fit rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                                    {copy.roleLabels[role as keyof typeof copy.roleLabels] ?? session.user.role}
                                </span>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{dashboard.title}</h1>
                                <p className="max-w-2xl text-sm text-zinc-600 sm:text-base lg:text-lg">{dashboard.description}</p>
                                <p className="text-sm text-zinc-500">
                                    {copy.signedInAs} <span className="font-medium text-zinc-800">{session.user.name}</span>
                                </p>
                                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                    {canCreateOrder && (
                                        <Link
                                            href="/orders/new"
                                            className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:w-auto"
                                        >
                                            {dashboard.actions.find((action) => action.href === "/orders/new")?.label ?? copy.newOrderFallback}
                                        </Link>
                                    )}
                                    <Link
                                        href="/orders"
                                        className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 sm:w-auto"
                                    >
                                        {copy.viewOrders}
                                    </Link>
                                    {role === "STAFF" && (
                                        <StaffBulkOrdersModal group={latestBulkGroup} locale={locale} />
                                    )}
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
                                <h2 className="text-lg font-semibold sm:text-xl">{copy.quickActions}</h2>
                                <p className="text-sm text-zinc-500">{copy.quickActionsDescription}</p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {dashboard.actions.map((action) => {
                                const isPrimary = action.href === "/orders/new";
                                const cardClass = isPrimary
                                    ? "rounded-2xl border border-zinc-900 bg-zinc-900 p-4 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800"
                                    : "rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white";
                                const titleClass = isPrimary
                                    ? "text-sm font-semibold text-white"
                                    : "text-sm font-medium text-zinc-900";
                                const descriptionClass = isPrimary
                                    ? "mt-2 text-sm text-zinc-200"
                                    : "mt-2 text-sm text-zinc-500";
                                const descriptionText = isPrimary ? copy.primaryAction : copy.secondaryAction;

                                return (
                                    <Link
                                        key={action.href}
                                        href={action.href}
                                        className={cardClass}
                                    >
                                        <p className={titleClass}>{action.label}</p>
                                        <p className={descriptionClass}>{descriptionText}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold sm:text-xl">{copy.recentOrders}</h2>
                                <p className="text-sm text-zinc-500">{copy.recentOrdersDescription}</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-zinc-500">{order.customer?.name ?? copy.unknownCustomer}</p>
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
                                            {copy.statusLabels[order.status as keyof typeof copy.statusLabels] ?? order.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-500">
                                        {copy.createdOn} {new Date(order.createdAt).toLocaleDateString(localeDate)}
                                    </p>
                                </div>
                            ))}                        </div>
                    </div>
                </div>

                {role === "OWNER" && (
                    <TelegramSettingsForm
                        initialBotToken={telegramSettings?.botToken ?? ""}
                        initialChatIds={telegramSettings?.chatIds ?? []}
                    />
                )}
            </section>
        </main>
    )
}
