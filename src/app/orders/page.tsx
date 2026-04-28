import OrdersAccordion from "@/components/orders/ordersAccordion";
import { getOrders } from "@/services/order.service";
import { cookies } from "next/headers";
import Link from "next/link";
import { getOrdersPageCopy } from "@/lib/i18n/orders";
import { localeCookieName, localeToIntl, resolveLocale } from "@/lib/locales";

type GetOrderResponse =  Awaited<ReturnType< typeof getOrders>>;
type Order = GetOrderResponse[number];

type OrderGroup = {
  id: string;
  isBulk: boolean;
  title: string;
  total: number;
  status: "PENDING" | "PAID" | "CANCELLED" | "MIXED";
  orders: Order[];
};

export default async function OrdersPage(){
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const copy = getOrdersPageCopy(locale);

  const orders: Order[] = await getOrders() ?? [];
  const pending = orders.filter((order) => order.status === "PENDING").length;
  const paid = orders.filter((order) => order.status === "PAID").length;

  const formatBulkDayLabel = (createdAt: string | Date) =>
    new Intl.DateTimeFormat(localeToIntl(locale), { weekday: "long" }).format(new Date(createdAt));

  const bulkCounts = orders.reduce((counts, order) => {
    if (!order.bulkBatchId) {
      return counts;
    }

    const current = counts.get(order.bulkBatchId) ?? 0;
    counts.set(order.bulkBatchId, current + 1);
    return counts;
  }, new Map<string, number>());

  const groupedOrders = Object.values(
    orders.reduce<Record<string, OrderGroup>>((groups, order) => {
      const groupId = order.bulkBatchId ? `bulk:${order.bulkBatchId}` : `single:${order.id}`;

      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          isBulk: Boolean(order.bulkBatchId),
          title: order.bulkBatchId
            ? `${copy.bulk.titlePrefix} (${bulkCounts.get(order.bulkBatchId) ?? 0} ${copy.bulk.titleSuffix}) • ${formatBulkDayLabel(order.createdAt)}`
            : order.customer.name,
          total: 0,
          status: "PENDING",
          orders: [],
        };
      }

      groups[groupId].orders.push(order);
      return groups;
    }, {})
  ).map((group) => {
    const total = group.orders.reduce(
      (sum, order) =>
        sum +
        order.orderProducts.reduce((orderSum, product) => orderSum + Number(product.unitPrice) * Number(product.quantity), 0),
      0
    );
    const uniqueStatuses = Array.from(new Set(group.orders.map((order) => order.status)));
    const status = (uniqueStatuses.length === 1 ? uniqueStatuses[0] : "MIXED") as OrderGroup["status"];

    return {
      ...group,
      total,
      status,
    };
  });

  return(
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.title}</h1>
          <p className="text-sm text-zinc-600 sm:text-base">{copy.subtitle}</p>
        </div>

        <Link href="/orders/new" className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto">
            {copy.newOrder}
        </Link>
        </div>


        <div className="overflow-hidden rounded-3xl">
          <div className="grid-cols-3 gap-1 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold grid  rounded-3xl">
            <span>{copy.table.customerOrBatch}</span>
            <span>{copy.table.total}</span>
            <span>{copy.table.status}</span>
          </div>
          <OrdersAccordion
            groups={groupedOrders.map((group) => ({
              ...group,
              orders: group.orders.map((order) => ({
                id: order.id,
                customerName: order.customer.name,
                total: order.orderProducts.reduce(
                  (sum, product) => sum + Number(product.unitPrice) * Number(product.quantity),
                  0
                ),
                status: order.status,
                quantity: order.orderProducts.reduce((sum, product) => sum + product.quantity, 0),
                items: order.orderProducts.map((product) => ({
                  id: product.product.id,
                  name: product.product.name,
                  quantity: product.quantity,
                  unitPrice: Number(product.unitPrice),
                })),
              })),
            }))}
          />
        </div>
        <div className="grid gap-3 grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{copy.stats.totalOrders}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{copy.stats.pending}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">{pending}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{copy.stats.paid}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">{paid}</p>
          </div>
        </div>
      </section>
    </main>
    )
}
