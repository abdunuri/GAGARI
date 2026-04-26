"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

type StatusToggleButtonProps = {
    status: ChildOrder["status"] | OrderGroup["status"];
    label: string;
    canToggle: boolean;
    title: string;
    onToggle: () => void;
};

function StatusToggleButton({ status, label, canToggle, title, onToggle }: StatusToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={canToggle ? onToggle : undefined}
            aria-label={label}
            aria-disabled={!canToggle}
            disabled={!canToggle}
            title={title}
            className={`${statusColorMap[status]} ${canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-60"} rounded-full border border-transparent px-2 py-1 text-left transition hover:border-zinc-300 hover:bg-zinc-100 disabled:hover:border-transparent disabled:hover:bg-transparent`}
        >
            {status}
        </button>
    );
}

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

type SingleOrderItemsProps = {
    items: OrderItem[];
    order: Pick<ChildOrder, "id" | "status" | "customerName" | "total">;
    onEditOrderItemQuantity: (
        order: Pick<ChildOrder, "id" | "customerName">,
        item: Pick<OrderItem, "id" | "name" | "quantity">
    ) => void;
    onDeleteOrder: (order: Pick<ChildOrder, "id" | "customerName">) => void;
};

function SingleOrderItems({ items, order, onEditOrderItemQuantity, onDeleteOrder }: SingleOrderItemsProps) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-medium text-zinc-900">{item.name}</p>
                            <p className="text-xs text-zinc-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="font-medium text-zinc-900">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEditOrderItemQuantity(order, item)}
                                    aria-label={`Edit quantity for ${item.name} in order ${order.id}`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.115 2.115 0 0 1 2.99 2.99L9.614 16.716 6 17.5l.784-3.614 10.078-10.4Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5.85 17.5 8.85" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteOrder(order)}
                                    aria-label={`Delete order ${order.id}`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.2 7l.7 11a2 2 0 0 0 2 1.9h4.2a2 2 0 0 0 2-1.9l.7-11" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function OrdersAccordion({ groups }: OrdersAccordionProps) {
    const router = useRouter();
    const [openGroupId, setOpenGroupId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const inFlightOrders = useRef(new Set<string>());

    const handleDeleteOrder = async (order: Pick<ChildOrder, "id" | "customerName">) => {
        const shouldDelete = window.confirm(`Delete order for "${order.customerName}"?`);
        if (!shouldDelete) {
            return;
        }

        try {
            const res = await fetch(`/api/order/${order.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Failed to delete order");
                return;
            }

            setMessage("Order deleted successfully");
            router.refresh();
        } catch {
            setMessage("Failed to delete order");
        }
    };

    const handleEditOrder = async (order: Pick<ChildOrder, "id" | "status" | "customerName" | "total" | "items">) => {
        if (order.items.length === 0) {
            setMessage("Order has no products to edit quantity.");
            return;
        }

        const productToEdit = order.items[0];

        const nextQuantityValue = window.prompt(
            `Edit quantity for ${productToEdit.name}`,
            String(productToEdit.quantity)
        );

        if (nextQuantityValue === null) {
            return;
        }

        const nextQuantity = Number(nextQuantityValue);
        if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
            setMessage("Quantity must be a positive integer.");
            return;
        }

        try {
            const res = await fetch(`/api/order/${order.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: productToEdit.id,
                    quantity: nextQuantity,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Failed to update order");
                return;
            }

            setMessage(`Quantity for ${productToEdit.name} updated to ${nextQuantity}. Total recalculated.`);
            router.refresh();
        } catch {
            setMessage("Failed to update quantity");
        }
    };

    const handleEditOrderItemQuantity = async (
        order: Pick<ChildOrder, "id" | "customerName">,
        item: Pick<OrderItem, "id" | "name" | "quantity">
    ) => {
        const nextQuantityValue = window.prompt(`Edit quantity for ${item.name}`, String(item.quantity));
        if (nextQuantityValue === null) {
            return;
        }

        const nextQuantity = Number(nextQuantityValue);
        if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
            setMessage("Quantity must be a positive integer.");
            return;
        }

        try {
            const res = await fetch(`/api/order/${order.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: item.id,
                    quantity: nextQuantity,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Failed to update quantity");
                return;
            }

            setMessage(`Quantity for ${item.name} updated to ${nextQuantity}. Total recalculated.`);
            router.refresh();
        } catch {
            setMessage("Failed to update quantity");
        }
    };

    const handleToggleOrderStatus = async (order: Pick<ChildOrder, "id" | "status" | "customerName">) => {
        if (order.status === "CANCELLED") {
            setMessage("Cancelled orders cannot be toggled.");
            return;
        }

        if (inFlightOrders.current.has(order.id)) {
            return;
        }

        const nextStatus = order.status === "PENDING" ? "PAID" : "PENDING";
        inFlightOrders.current.add(order.id);

        try {
            const res = await fetch(`/api/order/${order.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: nextStatus,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || "Failed to toggle order status");
                return;
            }

            setMessage(`Order for ${order.customerName} is now ${nextStatus}`);
            router.refresh();
        } catch {
            setMessage("Failed to toggle order status");
        } finally {
            inFlightOrders.current.delete(order.id);
        }
    };

    return (
        <>
            {message && <p className="px-6 py-3 text-sm text-zinc-700">{message}</p>}
            <div className="divide-y divide-zinc-200 gap-4  space-y-3">
                {groups.map((group) => {
                    const isOpen = openGroupId === group.id;

                    return (
                        <div key={group.id} className="border border-zinc-200 rounded-3xl">
                            <div className="grid w-full grid-cols-3 gap-4 px-6 py-4 text-left text-sm text-zinc-700 transition hover:bg-zinc-50">
                                <div className="flex flex-col gap-1">
                                        {/* show date the order was placed */}
                                    <span className="font-medium text-zinc-900 md:font-normal">{group.title}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-zinc-900 md:font-normal">${group.total.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <StatusToggleButton
                                        status={group.status}
                                        label={`Toggle status for ${group.title}`}
                                        canToggle={!group.isBulk && Boolean(group.orders[0])}
                                        title={!group.isBulk ? "Toggle status" : "Bulk orders cannot be toggled here"}
                                        onToggle={() => {
                                            if (group.orders[0]) {
                                                void handleToggleOrderStatus(group.orders[0]);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setOpenGroupId((current) => (current === group.id ? null : group.id))}
                                        >
                                    <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white lg:px-4 lg:py-1.5">
                                        {isOpen ? "Close" : "Open"}</span>
                                    </button>
                                </div>
                            </div>
                            {isOpen && (
                                <div className="border border-zinc-200 bg-zinc-50 px-6 py-3">
                                    {group.isBulk ? (
                                        <div className="space-y-3 rounded border border-emerald-400 bg-emerald-50 p-4">
                                            {group.orders.map((order) => (
                                                <div key={order.id} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium text-zinc-900">{order.customerName}</p>
                                                            <p className="text-xs text-zinc-500">Quantity: {order.quantity}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <StatusToggleButton
                                                                status={order.status}
                                                                label={`Toggle status for ${order.customerName}`}
                                                                canToggle={true}
                                                                title="Toggle status"
                                                                onToggle={() => void handleToggleOrderStatus(order)}
                                                            />
                                                                <p className="font-medium text-zinc-900">${order.total.toFixed(2)}</p>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditOrder({ ...order, items: order.items })}
                                                                    aria-label={`Edit order ${order.id}`}
                                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100"
                                                                >
                                                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.115 2.115 0 0 1 2.99 2.99L9.614 16.716 6 17.5l.784-3.614 10.078-10.4Z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5.85 17.5 8.85" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteOrder(order)}
                                                                    aria-label={`Delete order ${order.id}`}
                                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                                                                >
                                                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.2 7l.7 11a2 2 0 0 0 2 1.9h4.2a2 2 0 0 0 2-1.9l.7-11" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {group.orders[0] ? (
                                                <SingleOrderItems
                                                    items={group.orders[0].items}
                                                    order={group.orders[0]}
                                                    onEditOrderItemQuantity={handleEditOrderItemQuantity}
                                                    onDeleteOrder={handleDeleteOrder}
                                                />
                                            ) : (
                                                <OrderItems items={[]} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}