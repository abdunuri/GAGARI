import OrdersAccordion from "@/components/orders/ordersAccordion";
import { getOrders } from "@/services/order.service";
import Link from "next/link";

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
  const orders: Order[] = await getOrders() ?? [];
  const pending = orders.filter((order) => order.status === "PENDING").length;
  const paid = orders.filter((order) => order.status === "PAID").length;

  const formatBulkDayLabel = (createdAt: Date) =>
    new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(createdAt));

  const groupedOrders = Object.values(
    orders.reduce<Record<string, OrderGroup>>((groups, order) => {
      const groupId = order.bulkBatchId ? `bulk:${order.bulkBatchId}` : `single:${order.id}`;

      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          isBulk: Boolean(order.bulkBatchId),
          title: order.bulkBatchId
            ? `Bulk Order (${orders.filter((o) => o.bulkBatchId === order.bulkBatchId).length} orders) • ${formatBulkDayLabel(order.createdAt)}`
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h1>
            <p className="text-sm text-zinc-600 sm:text-base">View and manage customer orders.</p>
        </div>

        <Link href="/orders/new" className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto">
           New Order
        </Link>
        </div>


        <div className="overflow-hidden rounded-3xl">
          <div className="grid-cols-3 gap-1 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold grid  rounded-3xl">
            <span>Customer / Batch</span>
            <span>Total</span>
            <span>Status</span>
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Total Orders</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Pending</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">{pending}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Paid</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">{paid}</p>
          </div>
        </div>
      </section>
    </main>
    )
}