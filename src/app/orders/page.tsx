import OrderRow from "@/components/orders/orderRow";
import { getOrders } from "@/services/order.service";
import Link from "next/link";

export default async function OrdersPage(){
    const orders = await getOrders()
    return(
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-zinc-600">View and manage customer orders.</p>
        </div>

        <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
           <Link href="/orders/new">New Order</Link> 
        </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="grid grid-cols-4 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {orders.map((order) =>{
                const total = order.orderItems.reduce(
                    (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0
                );
                return (
                <OrderRow
                key={order.id}
                id={order.id}
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