"use client";

import { useState } from "react";
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

    const handleDeleteOrder = async (order: Pick<ChildOrder, "id" | "customerName">) => {
        const shouldDelete = window.confirm(`Delete order for \"${order.customerName}\"?`);
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

        let productToEdit = order.items[0];
        if (order.items.length > 1) {
            const productsText = order.items.map((item) => `${item.id} - ${item.name} (qty ${item.quantity})`).join("\n");
            const pickedProductIdValue = window.prompt(
                `Pick product id to edit quantity:\n${productsText}`,
                String(order.items[0].id)
            );

            if (pickedProductIdValue === null) {
                return;
            }

            const pickedProductId = Number(pickedProductIdValue);
            const foundProduct = order.items.find((item) => item.id === pickedProductId);
            if (!foundProduct) {
                setMessage("Invalid product id selected.");
                return;
            }

            productToEdit = foundProduct;
        }

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

        const nextStatus = order.status === "PENDING" ? "PAID" : "PENDING";

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
        }
    };

    return (
        <>
            {message && <p className="px-6 py-3 text-sm text-zinc-700">{message}</p>}
            <p className="px-6 py-2 text-xs text-zinc-500">Double-click status to toggle PENDING and PAID. Edit icon changes quantity and total is recalculated.</p>
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
                                        <span className="text-xs text-zinc-500">Tap to see item details and actions</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-zinc-900 md:font-normal">${group.total.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        onDoubleClick={(event) => {
                                            if (!group.isBulk && group.orders[0]) {
                                                event.stopPropagation();
                                                void handleToggleOrderStatus(group.orders[0]);
                                            }
                                        }}
                                        className={`${statusColorMap[group.status]} ${!group.isBulk ? "cursor-pointer" : ""}`}
                                        title={!group.isBulk ? "Double click to toggle PENDING/PAID" : undefined}
                                    >
                                        {group.status}
                                    </span>
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
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                                <p className="font-medium text-zinc-900">${order.total.toFixed(2)}</p>
                                                                <p
                                                                    onDoubleClick={() => handleToggleOrderStatus(order)}
                                                                    className={`${statusColorMap[order.status]} cursor-pointer`}
                                                                    title="Double click to toggle PENDING/PAID"
                                                                >
                                                                    {order.status}
                                                                </p>
                                                            </div>
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