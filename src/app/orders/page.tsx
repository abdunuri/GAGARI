import OrderRow from "@/components/orders/orderRow";
import { getOrders } from "@/services/order.service";
import Link from "next/link";

type Customer= {
  id:string,
  name:string,
  phoneNumber:string,
};
type GetOrderResponse =  Awaited<ReturnType< typeof getOrders>>;
type Order = GetOrderResponse[number];
type OrderProduct = {
  unitPrice: number;
  quantity: number;
};

export default async function OrdersPage(){
  // const res = await fetch(`${process.env["BETTER_AUTH_URL"]}/api/order`, { method: "GET" });
  // const data: GetOrderResponse = await res.json()
  const orders:GetOrderResponse = await getOrders() ?? [];
  const pending = orders.filter((order) => order.status === "PENDING").length;
  const paid = orders.filter((order) => order.status === "PAID").length;
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

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-3 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold md:grid">
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {orders.map((order: Order) =>{
                const total = (order.orderProducts as OrderProduct[]).reduce(
              (sum, product: OrderProduct) => sum + Number(product.unitPrice) * Number(product.quantity), 0
                );
                return (
                <OrderRow
                key={order.id}
                customerName={order.customer.name}
                total={total}
                status={order.status}/>
            )})}
          </div>
        </div>
      </section>
    </main>
    )
}