import { describe, it, expect } from "vitest";

// ──────────────────────────────────────────────
// Inline the pure helpers from StaffBulkOrdersModal so we can test them
// without importing the React component (which requires a jsdom environment).
// These mirror the exact implementation in src/components/dashboard/StaffBulkOrdersModal.tsx
// ──────────────────────────────────────────────

function toSafeNumber(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

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

function computeSummary(
    group: OrderGroup | null,
    loadedQuantity: string,
    quantityLeft: string,
    moneyInHand: string
) {
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
}

function computeAnalysisText(
    group: OrderGroup | null,
    loaded: number,
    left: number
): string {
    if (!group) {
        return "No bulk batch found yet. Create a bulk order from the new order page to start tracking van cash and quantities.";
    }

    if (loaded <= 0) {
        return "Add loaded bread and left bread to track current cash in van.";
    }

    if (left > loaded) {
        return "Left bread cannot be greater than loaded bread. Check the entered values.";
    }

    return `All orders are treated as delivered. Collected cash depends on which customers are toggled as PAID.`;
}

// ──────────────────────────────────────────────
// Test data factories
// ──────────────────────────────────────────────

function makeOrder(overrides: Partial<ChildOrder> = {}): ChildOrder {
    return {
        id: "order-1",
        customerName: "Alice",
        total: 10,
        status: "PENDING",
        quantity: 5,
        items: [],
        ...overrides,
    };
}

function makeGroup(overrides: Partial<OrderGroup> = {}): OrderGroup {
    return {
        id: "bulk:batch-1",
        isBulk: true,
        title: "Bulk Order (2 orders) • Monday",
        total: 20,
        status: "PENDING",
        orders: [makeOrder(), makeOrder({ id: "order-2", customerName: "Bob" })],
        ...overrides,
    };
}

// ──────────────────────────────────────────────
// Tests for toSafeNumber
// ──────────────────────────────────────────────

describe("toSafeNumber", () => {
    it("parses a valid integer string", () => {
        expect(toSafeNumber("42")).toBe(42);
    });

    it("parses a valid decimal string", () => {
        expect(toSafeNumber("3.14")).toBe(3.14);
    });

    it("returns 0 for empty string", () => {
        expect(toSafeNumber("")).toBe(0);
    });

    it("returns 0 for non-numeric string", () => {
        expect(toSafeNumber("abc")).toBe(0);
    });

    it("returns 0 for NaN string", () => {
        expect(toSafeNumber("NaN")).toBe(0);
    });

    it("returns 0 for Infinity string", () => {
        expect(toSafeNumber("Infinity")).toBe(0);
    });

    it("returns 0 for -Infinity string", () => {
        expect(toSafeNumber("-Infinity")).toBe(0);
    });

    it("returns the number for '0'", () => {
        expect(toSafeNumber("0")).toBe(0);
    });

    it("handles negative numeric strings", () => {
        expect(toSafeNumber("-5")).toBe(-5);
    });

    it("handles whitespace-padded string", () => {
        // Number("  10  ") === 10, which is finite
        expect(toSafeNumber("  10  ")).toBe(10);
    });
});

// ──────────────────────────────────────────────
// Tests for computeSummary
// ──────────────────────────────────────────────

describe("computeSummary - null group", () => {
    it("returns zero values when group is null", () => {
        const s = computeSummary(null, "", "", "");
        expect(s.expectedMoney).toBe(0);
        expect(s.expectedQuantity).toBe(0);
        expect(s.paidCustomersCount).toBe(0);
        expect(s.totalCustomersCount).toBe(0);
        expect(s.collectedMoney).toBe(0);
        expect(s.remainingMoney).toBe(0);
        expect(s.currentCashInVan).toBe(0);
        expect(s.cashGapToTarget).toBe(0);
    });
});

describe("computeSummary - expected money and quantity", () => {
    it("computes expectedMoney from group total", () => {
        const group = makeGroup({ total: 150 });
        const s = computeSummary(group, "", "", "");
        expect(s.expectedMoney).toBe(150);
    });

    it("computes expectedQuantity as sum of all order quantities", () => {
        const group = makeGroup({
            orders: [makeOrder({ quantity: 4 }), makeOrder({ id: "o2", quantity: 6 })],
        });
        const s = computeSummary(group, "", "", "");
        expect(s.expectedQuantity).toBe(10);
    });

    it("delivered equals expectedQuantity", () => {
        const group = makeGroup({
            orders: [makeOrder({ quantity: 7 }), makeOrder({ id: "o2", quantity: 3 })],
        });
        const s = computeSummary(group, "", "", "");
        expect(s.delivered).toBe(s.expectedQuantity);
        expect(s.delivered).toBe(10);
    });
});

describe("computeSummary - paid customers and collected money", () => {
    it("counts only PAID orders as paid", () => {
        const group = makeGroup({
            orders: [
                makeOrder({ status: "PAID" }),
                makeOrder({ id: "o2", status: "PENDING" }),
                makeOrder({ id: "o3", status: "CANCELLED" }),
            ],
        });
        const s = computeSummary(group, "", "", "");
        expect(s.paidCustomersCount).toBe(1);
        expect(s.totalCustomersCount).toBe(3);
    });

    it("collectedMoney sums totals of PAID orders only", () => {
        const group = makeGroup({
            total: 50,
            orders: [
                makeOrder({ status: "PAID", total: 15 }),
                makeOrder({ id: "o2", status: "PAID", total: 20 }),
                makeOrder({ id: "o3", status: "PENDING", total: 15 }),
            ],
        });
        const s = computeSummary(group, "", "", "");
        expect(s.collectedMoney).toBe(35);
    });

    it("remainingMoney is expectedMoney minus collectedMoney", () => {
        const group = makeGroup({
            total: 100,
            orders: [
                makeOrder({ status: "PAID", total: 30 }),
                makeOrder({ id: "o2", status: "PENDING", total: 70 }),
            ],
        });
        const s = computeSummary(group, "", "", "");
        expect(s.remainingMoney).toBe(70);
    });

    it("remainingMoney is never negative (clamped to 0)", () => {
        // If collectedMoney somehow exceeds expectedMoney, remainingMoney should be 0
        const group = makeGroup({
            total: 10,
            orders: [makeOrder({ status: "PAID", total: 50 })],
        });
        const s = computeSummary(group, "", "", "");
        expect(s.remainingMoney).toBe(0);
    });
});

describe("computeSummary - van quantity and cash analysis", () => {
    it("loaded defaults to 0 when loadedQuantity is empty", () => {
        const s = computeSummary(makeGroup(), "", "", "");
        expect(s.loaded).toBe(0);
    });

    it("loaded is max(0, toSafeNumber(loadedQuantity))", () => {
        const s = computeSummary(makeGroup(), "50", "", "");
        expect(s.loaded).toBe(50);
    });

    it("loaded is clamped to 0 for negative values", () => {
        const s = computeSummary(makeGroup(), "-10", "", "");
        expect(s.loaded).toBe(0);
    });

    it("left is max(0, toSafeNumber(quantityLeft))", () => {
        const s = computeSummary(makeGroup(), "50", "15", "");
        expect(s.left).toBe(15);
    });

    it("computes avgUnitPrice correctly when expectedQuantity > 0", () => {
        const group = makeGroup({
            total: 100,
            orders: [makeOrder({ quantity: 10 }), makeOrder({ id: "o2", quantity: 10 })],
        });
        const s = computeSummary(group, "", "", "");
        // avg = 100 / 20 = 5
        expect(s.avgUnitPrice).toBe(5);
    });

    it("avgUnitPrice is 0 when expectedQuantity is 0", () => {
        const group = makeGroup({
            total: 50,
            orders: [makeOrder({ quantity: 0 })],
        });
        const s = computeSummary(group, "", "", "");
        expect(s.avgUnitPrice).toBe(0);
    });

    it("currentCashInVan = max(loaded - left, 0) * avgUnitPrice", () => {
        const group = makeGroup({
            total: 100,
            orders: [makeOrder({ quantity: 10 }), makeOrder({ id: "o2", quantity: 10 })],
        });
        // avg = 100 / 20 = 5; loaded=30, left=10 → (30-10)*5 = 100
        const s = computeSummary(group, "30", "10", "");
        expect(s.currentCashInVan).toBe(100);
    });

    it("currentCashInVan is 0 when left > loaded (clamped)", () => {
        const group = makeGroup({
            total: 100,
            orders: [makeOrder({ quantity: 10 }), makeOrder({ id: "o2", quantity: 10 })],
        });
        const s = computeSummary(group, "5", "10", "");
        expect(s.currentCashInVan).toBe(0);
    });

    it("computes cashGapToTarget as abs(currentCashInVan - currentMoneyInHand)", () => {
        const group = makeGroup({
            total: 100,
            orders: [makeOrder({ quantity: 10 }), makeOrder({ id: "o2", quantity: 10 })],
        });
        // avg=5, loaded=30, left=10 → cashInVan=100; moneyInHand=80; gap=20
        const s = computeSummary(group, "30", "10", "80");
        expect(s.cashGapToTarget).toBe(20);
    });

    it("cashGapToTarget is always non-negative", () => {
        const group = makeGroup({
            total: 100,
            orders: [makeOrder({ quantity: 10 }), makeOrder({ id: "o2", quantity: 10 })],
        });
        // moneyInHand > currentCashInVan → still positive gap
        const s = computeSummary(group, "10", "0", "200");
        expect(s.cashGapToTarget).toBeGreaterThanOrEqual(0);
    });

    it("currentMoneyInHand is clamped to 0 for negative input", () => {
        const s = computeSummary(makeGroup(), "", "", "-100");
        expect(s.currentMoneyInHand).toBe(0);
    });
});

// ──────────────────────────────────────────────
// Tests for computeAnalysisText
// ──────────────────────────────────────────────

describe("computeAnalysisText", () => {
    it("returns no-group message when group is null", () => {
        const text = computeAnalysisText(null, 0, 0);
        expect(text).toContain("No bulk batch found yet");
    });

    it("returns 'add loaded bread' message when loaded is 0", () => {
        const text = computeAnalysisText(makeGroup(), 0, 0);
        expect(text).toContain("Add loaded bread");
    });

    it("returns error message when left > loaded", () => {
        const text = computeAnalysisText(makeGroup(), 5, 10);
        expect(text).toContain("Left bread cannot be greater than loaded bread");
    });

    it("returns delivered message when loaded > 0 and left <= loaded", () => {
        const text = computeAnalysisText(makeGroup(), 20, 5);
        expect(text).toContain("All orders are treated as delivered");
    });

    it("returns delivered message when left equals loaded (0 delivered)", () => {
        const text = computeAnalysisText(makeGroup(), 10, 10);
        expect(text).toContain("All orders are treated as delivered");
    });

    it("returns 'add loaded bread' when group exists but loaded is negative (treated as 0)", () => {
        // loaded is clamped before calling analysisText, so passing 0 simulates that
        const text = computeAnalysisText(makeGroup(), 0, 0);
        expect(text).toContain("Add loaded bread");
    });
});