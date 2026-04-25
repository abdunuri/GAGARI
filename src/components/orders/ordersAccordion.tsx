"use client";

import { useState } from "react";

type OrderItem = {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
};

type ChildOrder = {
    id: string;
    customerName: string;
    total: number;
    status: "PENDING" | "PAID" | "CANCELLED";
    quantity: number;
    items: OrderItem[];
};

type OrderGroup = {
    id: string;
    isBulk: boolean;
    title: string;
    total: number;
    status: "PENDING" | "PAID" | "CANCELLED" | "MIXED";
    orders: ChildOrder[];
};

type OrdersAccordionProps = {
    groups: OrderGroup[];
};

const statusColorMap = {
    PAID: "font-medium text-emerald-600",
    PENDING: "font-medium text-amber-600",
    CANCELLED: "font-medium text-rose-600",
    MIXED: "font-medium text-zinc-600",
} as const;

function OrderItems({ items }: { items: OrderItem[] }) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
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
    );
}

export default function OrdersAccordion({ groups }: OrdersAccordionProps) {
    const [openGroupId, setOpenGroupId] = useState<string | null>(null);

    return (
        <div className="divide-y divide-zinc-200">
            {groups.map((group) => {
                const isOpen = openGroupId === group.id;

                return (
                    <div key={group.id}>
                        <button
                            type="button"
                            onClick={() => setOpenGroupId((current) => (current === group.id ? null : group.id))}
                            className="grid w-full grid-cols-3 gap-4 px-6 py-4 text-left text-sm text-zinc-700 transition hover:bg-zinc-50"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-zinc-900 md:font-normal">{group.title}</span>
                                {group.isBulk ? (
                                    <span className="text-xs text-zinc-500">{group.orders.length} customer order{group.orders.length === 1 ? "" : "s"}</span>
                                ) : (
                                    <span className="text-xs text-zinc-500">Tap to see item details</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-zinc-900 md:font-normal">${group.total.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className={statusColorMap[group.status]}>{group.status}</span>
                                <span className="text-xs font-medium text-zinc-500">{isOpen ? "Close" : "Open"}</span>
                            </div>
                        </button>

                        {isOpen && (
                            <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
                                {group.isBulk ? (
                                    <div className="space-y-3">
                                        {group.orders.map((order) => (
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
                                ) : (
                                    <OrderItems items={group.orders[0]?.items ?? []} />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}