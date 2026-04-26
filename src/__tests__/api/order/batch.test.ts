import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server before importing the route
vi.mock("next/server", () => {
    return {
        NextResponse: {
            json: (data: unknown, init?: { status?: number }) => ({
                _data: data,
                _status: init?.status ?? 200,
                json: async () => data,
                status: init?.status ?? 200,
            }),
        },
    };
});

// Mock the order service
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
        createOrdersBatch: vi.fn(),
        OrderServiceError,
    };
});

import { POST } from "@/app/api/order/batch/route";
import { createOrdersBatch, OrderServiceError } from "@/services/order.service";

type MockResponse = { _data: Record<string, unknown>; _status: number };

function makeRequest(body: unknown, failParse = false): Request {
    return {
        json: failParse
            ? () => Promise.reject(new SyntaxError("Unexpected token"))
            : () => Promise.resolve(body),
        headers: new Headers(),
    } as unknown as Request;
}

const validOrder = {
    customerId: 1,
    orderProducts: [{ productId: 1, unitPrice: 2.5, quantity: 3 }],
};

const validBody = {
    bulkBatchId: "batch-abc",
    bulkExpectedCount: 1,
    orders: [validOrder],
};

describe("POST /api/order/batch", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 for invalid JSON", async () => {
        const req = makeRequest(null, true);
        const res = (await POST(req)) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid JSON payload." });
    });

    it("returns 400 when body is not an object", async () => {
        const res = (await POST(makeRequest([1, 2, 3]))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: expect.stringContaining("JSON object") });
    });

    it("returns 400 when body is null", async () => {
        const res = (await POST(makeRequest(null))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when bulkBatchId is missing", async () => {
        const res = (await POST(
            makeRequest({ bulkExpectedCount: 1, orders: [validOrder] })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toMatch(/batch id/);
    });

    it("returns 400 when bulkBatchId is empty string", async () => {
        const res = (await POST(
            makeRequest({ bulkBatchId: "   ", bulkExpectedCount: 1, orders: [validOrder] })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when bulkExpectedCount is missing", async () => {
        const res = (await POST(
            makeRequest({ bulkBatchId: "batch-1", orders: [validOrder] })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when bulkExpectedCount is zero", async () => {
        const res = (await POST(
            makeRequest({ bulkBatchId: "batch-1", bulkExpectedCount: 0, orders: [validOrder] })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when bulkExpectedCount is negative", async () => {
        const res = (await POST(
            makeRequest({ bulkBatchId: "batch-1", bulkExpectedCount: -1, orders: [validOrder] })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when orders array is empty", async () => {
        const res = (await POST(
            makeRequest({ bulkBatchId: "batch-1", bulkExpectedCount: 1, orders: [] })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when orders is not an array", async () => {
        const res = (await POST(
            makeRequest({ bulkBatchId: "batch-1", bulkExpectedCount: 1, orders: "bad" })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when an order has customerId of 0", async () => {
        const res = (await POST(
            makeRequest({
                bulkBatchId: "batch-1",
                bulkExpectedCount: 1,
                orders: [{ customerId: 0, orderProducts: [{ productId: 1, unitPrice: 1, quantity: 1 }] }],
            })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when an order has negative productId", async () => {
        const res = (await POST(
            makeRequest({
                bulkBatchId: "batch-1",
                bulkExpectedCount: 1,
                orders: [{ customerId: 1, orderProducts: [{ productId: -1, unitPrice: 1, quantity: 1 }] }],
            })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when a product has negative unitPrice", async () => {
        const res = (await POST(
            makeRequest({
                bulkBatchId: "batch-1",
                bulkExpectedCount: 1,
                orders: [{ customerId: 1, orderProducts: [{ productId: 1, unitPrice: -5, quantity: 1 }] }],
            })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when a product has quantity of 0", async () => {
        const res = (await POST(
            makeRequest({
                bulkBatchId: "batch-1",
                bulkExpectedCount: 1,
                orders: [{ customerId: 1, orderProducts: [{ productId: 1, unitPrice: 1, quantity: 0 }] }],
            })
        )) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 201 and created orders on success", async () => {
        const mockOrders = [{ id: "order-1" }, { id: "order-2" }];
        vi.mocked(createOrdersBatch).mockResolvedValueOnce(mockOrders as never);

        const res = (await POST(makeRequest(validBody))) as unknown as MockResponse;
        expect(res._status).toBe(201);
        expect(res._data).toMatchObject({
            message: "Created 2 orders successfully",
            orders: mockOrders,
        });
    });

    it("uses singular 'order' when only 1 order created", async () => {
        vi.mocked(createOrdersBatch).mockResolvedValueOnce([{ id: "order-1" }] as never);

        const res = (await POST(makeRequest(validBody))) as unknown as MockResponse;
        expect(res._status).toBe(201);
        expect((res._data.message as string)).toContain("1 order successfully");
    });

    it("trims whitespace from bulkBatchId before calling service", async () => {
        vi.mocked(createOrdersBatch).mockResolvedValueOnce([] as never);

        await POST(makeRequest({ ...validBody, bulkBatchId: "  batch-123  " }));
        expect(createOrdersBatch).toHaveBeenCalledWith(
            expect.objectContaining({ bulkBatchId: "batch-123" })
        );
    });

    it("returns 400 when OrderServiceError with INVALID_PAYLOAD is thrown", async () => {
        vi.mocked(createOrdersBatch).mockRejectedValueOnce(
            new OrderServiceError("INVALID_PAYLOAD", "Invalid payload")
        );
        const res = (await POST(makeRequest(validBody))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid payload" });
    });

    it("returns 401 when OrderServiceError with UNAUTHORIZED is thrown", async () => {
        vi.mocked(createOrdersBatch).mockRejectedValueOnce(
            new OrderServiceError("UNAUTHORIZED", "Not signed in")
        );
        const res = (await POST(makeRequest(validBody))) as unknown as MockResponse;
        expect(res._status).toBe(401);
    });

    it("returns 403 when OrderServiceError with NOT_ALLOWED is thrown", async () => {
        vi.mocked(createOrdersBatch).mockRejectedValueOnce(
            new OrderServiceError("NOT_ALLOWED", "Not allowed")
        );
        const res = (await POST(makeRequest(validBody))) as unknown as MockResponse;
        expect(res._status).toBe(403);
    });

    it("returns 404 when OrderServiceError with NOT_FOUND is thrown", async () => {
        vi.mocked(createOrdersBatch).mockRejectedValueOnce(
            new OrderServiceError("NOT_FOUND", "Not found")
        );
        const res = (await POST(makeRequest(validBody))) as unknown as MockResponse;
        expect(res._status).toBe(404);
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(createOrdersBatch).mockRejectedValueOnce(new Error("DB failure"));
        const res = (await POST(makeRequest(validBody))) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to create batch orders." });
    });

    it("allows unitPrice of 0 (free items)", async () => {
        vi.mocked(createOrdersBatch).mockResolvedValueOnce([{ id: "order-1" }] as never);
        const bodyWithFreeItem = {
            ...validBody,
            orders: [{ customerId: 1, orderProducts: [{ productId: 1, unitPrice: 0, quantity: 1 }] }],
        };
        const res = (await POST(makeRequest(bodyWithFreeItem))) as unknown as MockResponse;
        expect(res._status).toBe(201);
    });
});