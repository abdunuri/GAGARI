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
type OrderItem = Order["orderItems"][number]

export default async function OrdersPage(){
  // const res = await fetch(`${process.env["BETTER_AUTH_URL"]}/api/order`, { method: "GET" });
  // const data: GetOrderResponse = await res.json()
  const orders:GetOrderResponse = await getOrders() ?? [];
  console.log(orders)
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

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-3 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold md:grid">
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {orders.map((order: Order) =>{
                const total = order.orderItems.reduce(
                (sum, item: OrderItem) => sum + Number(item.unitPrice) * Number(item.quantity), 0
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