import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
    NextResponse: {
        json: (data: unknown, init?: { status?: number }) => ({
            _data: data,
            _status: init?.status ?? 200,
        }),
    },
}));

vi.mock("@/services/order.service", () => {
    const OrderServiceError = class extends Error {
        code: string;
        constructor(code: string, message: string) {
            super(message);
            this.name = "OrderServiceError";
            this.code = code;
        }
    };

    return {
        getCustomerLastDayBulkQuantities: vi.fn(),
        OrderServiceError,
    };
});

import { GET } from "@/app/api/order/last-day-quantities/route";
import { getCustomerLastDayBulkQuantities, OrderServiceError } from "@/services/order.service";

type MockResponse = { _data: Record<string, unknown>; _status: number };

describe("GET /api/order/last-day-quantities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 200 with quantities on success", async () => {
        const mockQuantities = [
            { customerId: 1, quantity: 5, orderedAt: "2026-04-26T10:00:00Z" },
            { customerId: 2, quantity: 3, orderedAt: "2026-04-26T10:00:00Z" },
        ];
        vi.mocked(getCustomerLastDayBulkQuantities).mockResolvedValueOnce(mockQuantities as never);

        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({
            message: "Fetched last-day bulk quantities successfully.",
            quantities: mockQuantities,
        });
    });

    it("returns 200 with empty array when no quantities exist", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockResolvedValueOnce([] as never);

        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({ quantities: [] });
    });

    it("returns 400 when OrderServiceError with INVALID_PAYLOAD is thrown", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockRejectedValueOnce(
            new OrderServiceError("INVALID_PAYLOAD", "Invalid payload")
        );
        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid payload" });
    });

    it("returns 401 when OrderServiceError with UNAUTHORIZED is thrown", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockRejectedValueOnce(
            new OrderServiceError("UNAUTHORIZED", "Unauthorized")
        );
        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(401);
    });

    it("returns 403 when OrderServiceError with NOT_ALLOWED is thrown", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockRejectedValueOnce(
            new OrderServiceError("NOT_ALLOWED", "Forbidden")
        );
        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(403);
    });

    it("returns 404 when OrderServiceError with NOT_FOUND is thrown", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockRejectedValueOnce(
            new OrderServiceError("NOT_FOUND", "Not found")
        );
        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(404);
    });

    it("returns 500 for OrderServiceError with unknown code", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockRejectedValueOnce(
            new OrderServiceError("PRODUCT_NOT_IN_ORDER", "Product not in order")
        );
        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 500 for unexpected non-OrderServiceError errors", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockRejectedValueOnce(
            new Error("Database connection failed")
        );
        const res = (await GET()) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to fetch last-day bulk quantities." });
    });

    it("calls getCustomerLastDayBulkQuantities exactly once", async () => {
        vi.mocked(getCustomerLastDayBulkQuantities).mockResolvedValueOnce([] as never);
        await GET();
        expect(getCustomerLastDayBulkQuantities).toHaveBeenCalledTimes(1);
    });
});