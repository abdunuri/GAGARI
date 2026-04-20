type OrderRowProps = {
    customerName : string;
    total: number;
    status : "PENDING" | "PAID" | "CANCELLED" | "MIXED";
    isBulk?: boolean;
    childOrders?: {
        id: string;
        customerName: string;
        total: number;
        status: "PENDING" | "PAID" | "CANCELLED";
        quantity: number;
        items: {
            id: number;
            name: string;
            quantity: number;
            unitPrice: number;
        }[];
    }[];
};

const statusColorMap = {
    PAID: "font-medium text-emerald-600",
    PENDING: "font-medium text-amber-600",
    CANCELLED: "font-medium text-rose-600",
    MIXED: "font-medium text-zinc-600",
} as const;

export default function OrderRow({customerName,total,status,isBulk=false,childOrders=[]}:OrderRowProps){
    if (isBulk && childOrders.length > 0) {
        return (
            <details className="group">
                <summary className="grid cursor-pointer list-none grid-cols-3 gap-4 px-6 py-4 text-sm text-zinc-700 marker:content-none">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">{customerName}</span>
                        <span className="text-xs text-zinc-500">{childOrders.length} customer order{childOrders.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={statusColorMap[status]}>{status}</span>
                    </div>
                </summary>
                <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
                    <div className="space-y-3">
                        {childOrders.map((order) => (
                            <div key={order.id} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-zinc-900">{order.customerName}</p>
                                        <p className="text-xs text-zinc-500">Quantity: {order.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-zinc-900">${order.total.toFixed(2)}</p>
                                        <p className={statusColorMap[order.status]}>{order.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </details>
        );
    }

    return(
            <details className="group">
                <summary className="grid cursor-pointer list-none grid-cols-3 gap-4 px-6 py-4 text-sm text-zinc-700 marker:content-none">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">{customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={statusColorMap[status]}>{status}</span>
                    </div>
                </summary>
                <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
                    <div className="space-y-3">
                        {childOrders[0]?.items.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-zinc-900">{item.name}</p>
                                        <p className="text-xs text-zinc-500">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-zinc-900">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </details>
)}