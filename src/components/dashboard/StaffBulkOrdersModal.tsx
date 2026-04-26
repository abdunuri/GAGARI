"use client";

import { useMemo, useState } from "react";
import OrdersAccordion from "@/components/orders/ordersAccordion";

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

type StaffBulkOrdersModalProps = {
    group: OrderGroup | null;
};

function toSafeNumber(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function StaffBulkOrdersModal({ group }: StaffBulkOrdersModalProps) {
    const [open, setOpen] = useState(false);
    const [loadedQuantity, setLoadedQuantity] = useState("");
    const [quantityLeft, setQuantityLeft] = useState("");
    const [moneyInHand, setMoneyInHand] = useState("");

    const summary = useMemo(() => {
        const expectedMoney = group?.total ?? 0;
        const expectedQuantity =
            group?.orders.reduce((sum, order) => sum + order.quantity, 0) ?? 0;
        const paidCustomersCount =
            group?.orders.filter((order) => order.status === "PAID").length ?? 0;
        const totalCustomersCount = group?.orders.length ?? 0;
        const collectedMoney =
            group?.orders
                .filter((order) => order.status === "PAID")
                .reduce((sum, order) => sum + order.total, 0) ?? 0;

        const remainingMoney = Math.max(expectedMoney - collectedMoney, 0);
        const loaded = Math.max(0, toSafeNumber(loadedQuantity));
        const left = Math.max(0, toSafeNumber(quantityLeft));
        const delivered = expectedQuantity;
        const avgUnitPrice = expectedQuantity > 0 ? expectedMoney / expectedQuantity : 0;
        const currentCashInVan = Math.max(loaded - left, 0) * avgUnitPrice;
        const currentMoneyInHand = Math.max(0, toSafeNumber(moneyInHand));
        const cashGapToTarget = Math.abs(currentCashInVan - currentMoneyInHand);

        return {
            expectedMoney,
            collectedMoney,
            remainingMoney,
            paidCustomersCount,
            totalCustomersCount,
            expectedQuantity,
            loaded,
            left,
            currentCashInVan,
            currentMoneyInHand,
            cashGapToTarget,
            delivered,
            avgUnitPrice,
        };
    }, [group, loadedQuantity, quantityLeft, moneyInHand]);

    const analysisText = useMemo(() => {
        if (!group) {
            return "No bulk batch found yet. Create a bulk order from the new order page to start tracking van cash and quantities.";
        }

        if (summary.loaded <= 0) {
            return "Add loaded bread and left bread to track current cash in van.";
        }

        if (summary.left > summary.loaded) {
            return "Left bread cannot be greater than loaded bread. Check the entered values.";
        }

        return `All orders are treated as delivered. Collected cash depends on which customers are toggled as PAID.`;
    }, [group, summary.left, summary.loaded]);

    return (
        <>
            <button
                type="button"
                disabled={!group}
                onClick={() => setOpen(true)}
                className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
                Latest Bulk Run
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-900/55 px-3 py-6 sm:px-6">
                    <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl sm:p-6">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Latest Bulk Batch</h2>
                                <p className="mt-1 text-sm text-zinc-600">
                                    Staff view for one latest created bulk order with payment and delivery tracking.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Total Expected Money</p>
                                <p className="mt-2 text-2xl font-semibold text-zinc-900">${summary.expectedMoney.toFixed(2)}</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Total Collected</p>
                                <p className="mt-2 text-2xl font-semibold text-emerald-700">${summary.collectedMoney.toFixed(2)}</p>
                            </div>
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Total Remaining</p>
                                <p className="mt-2 text-2xl font-semibold text-amber-700">${summary.remainingMoney.toFixed(2)}</p>
                            </div>
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Paid Customers</p>
                                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                                    {summary.paidCustomersCount}/{summary.totalCustomersCount}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:col-span-2 xl:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Cash Gap To Target</p>
                                <p className="mt-2 text-2xl font-semibold text-rose-700">${summary.cashGapToTarget.toFixed(2)}</p>
                                <p className="mt-1 text-xs text-rose-700">
                                    Gap between Current Cash In Van and Real Money In Hand.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4">
                            <h3 className="text-base font-semibold text-zinc-900">Van Quantity Analysis</h3>
                            <p className="mt-1 text-sm text-zinc-600">
                                Enter loaded and left bread quantities to get current cash in van from quantity difference and unit price.
                            </p>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <label className="block">
                                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Loaded Product (Bread)</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={loadedQuantity}
                                        onChange={(e) => setLoadedQuantity(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                                        placeholder="0"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Left Bread</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={quantityLeft}
                                        onChange={(e) => setQuantityLeft(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                                        placeholder="0"
                                    />
                                </label>
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Delivered</p>
                                    <p className="mt-1 text-lg font-semibold text-zinc-900">{summary.delivered}</p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Current Cash In Van</p>
                                    <p className="mt-1 text-lg font-semibold text-zinc-900">${summary.currentCashInVan.toFixed(2)}</p>
                                </div>
                                <label className="block sm:col-span-2 lg:col-span-4">
                                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Real Money In Hand (Current)</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={moneyInHand}
                                        onChange={(e) => setMoneyInHand(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                                        placeholder="0"
                                    />
                                </label>
                            </div>

                            <p className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                                {analysisText}
                            </p>
                        </div>

                        <div className="mt-5">
                            {group ? (
                                <OrdersAccordion groups={[group]} />
                            ) : (
                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                                    No bulk orders found for your current scope.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
