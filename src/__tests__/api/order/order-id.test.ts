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
        updateOrder: vi.fn(),
        deleteOrder: vi.fn(),
        OrderServiceError,
    };
});

vi.mock("@/app/api/order/validators", () => ({
    isJsonObjectBody: (body: unknown) =>
        Boolean(body) && typeof body === "object" && !Array.isArray(body),
    hasOwn: (payload: Record<string, unknown>, key: string) =>
        Object.prototype.hasOwnProperty.call(payload, key),
}));

import { PUT, DELETE } from "@/app/api/order/[id]/route";
import { updateOrder, deleteOrder, OrderServiceError } from "@/services/order.service";

type MockResponse = { _data: Record<string, unknown>; _status: number };

function makeRequest(body: unknown, failParse = false): Request {
    return {
        json: failParse
            ? () => Promise.reject(new SyntaxError("Bad JSON"))
            : () => Promise.resolve(body),
        headers: new Headers(),
    } as unknown as Request;
}

function makeContext(id: string) {
    return { params: Promise.resolve({ id }) };
}

describe("PUT /api/order/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 for invalid JSON", async () => {
        const res = (await PUT(makeRequest(null, true), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid JSON payload." });
    });

    it("returns 400 when body is an array", async () => {
        const res = (await PUT(makeRequest([1, 2]), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("JSON object");
    });

    it("returns 400 when body has no recognized fields", async () => {
        const res = (await PUT(makeRequest({ unrecognized: true }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("Validation failed");
    });

    it("returns 400 when productId is given without quantity", async () => {
        const res = (await PUT(makeRequest({ productId: 1 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("Both productId and quantity");
    });

    it("returns 400 when quantity is given without productId", async () => {
        const res = (await PUT(makeRequest({ quantity: 5 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("Both productId and quantity");
    });

    it("returns 400 for invalid status value", async () => {
        const res = (await PUT(makeRequest({ status: "INVALID" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("PENDING, PAID, CANCELLED");
    });

    it("accepts PENDING as a valid status", async () => {
        vi.mocked(updateOrder).mockResolvedValueOnce({ id: "order-1" } as never);
        const res = (await PUT(makeRequest({ status: "PENDING" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
    });

    it("accepts PAID as a valid status", async () => {
        vi.mocked(updateOrder).mockResolvedValueOnce({ id: "order-1" } as never);
        const res = (await PUT(makeRequest({ status: "PAID" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
    });

    it("accepts CANCELLED as a valid status", async () => {
        vi.mocked(updateOrder).mockResolvedValueOnce({ id: "order-1" } as never);
        const res = (await PUT(makeRequest({ status: "CANCELLED" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
    });

    it("returns 400 when totalAmount is zero", async () => {
        const res = (await PUT(makeRequest({ totalAmount: 0 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("totalAmount must be a positive number");
    });

    it("returns 400 when totalAmount is negative", async () => {
        const res = (await PUT(makeRequest({ totalAmount: -5 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when totalAmount is NaN (string 'abc')", async () => {
        const res = (await PUT(makeRequest({ totalAmount: "abc" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when productId is 0", async () => {
        const res = (await PUT(makeRequest({ productId: 0, quantity: 2 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("productId must be a positive integer");
    });

    it("returns 400 when productId is a float", async () => {
        const res = (await PUT(makeRequest({ productId: 1.5, quantity: 2 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when quantity is 0", async () => {
        const res = (await PUT(makeRequest({ productId: 1, quantity: 0 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("quantity must be a positive integer");
    });

    it("returns 400 when quantity is negative", async () => {
        const res = (await PUT(makeRequest({ productId: 1, quantity: -2 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 200 on successful product quantity update", async () => {
        const mockOrder = { id: "order-1", status: "PENDING" };
        vi.mocked(updateOrder).mockResolvedValueOnce(mockOrder as never);

        const res = (await PUT(makeRequest({ productId: 1, quantity: 5 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({ message: "Order updated successfully", order: mockOrder });
    });

    it("returns 200 on successful totalAmount update", async () => {
        vi.mocked(updateOrder).mockResolvedValueOnce({ id: "order-1" } as never);
        const res = (await PUT(makeRequest({ totalAmount: 99.99 }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
    });

    it("calls updateOrder with the correct id and payload", async () => {
        vi.mocked(updateOrder).mockResolvedValueOnce({ id: "my-order" } as never);
        await PUT(makeRequest({ status: "PAID" }), makeContext("my-order"));
        expect(updateOrder).toHaveBeenCalledWith("my-order", { status: "PAID" });
    });

    it("parses numeric totalAmount from string representation", async () => {
        vi.mocked(updateOrder).mockResolvedValueOnce({ id: "order-1" } as never);
        const res = (await PUT(makeRequest({ totalAmount: "50.5" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(updateOrder).toHaveBeenCalledWith("order-1", { totalAmount: 50.5 });
    });

    it("returns 400 for OrderServiceError with INVALID_PAYLOAD", async () => {
        vi.mocked(updateOrder).mockRejectedValueOnce(
            new OrderServiceError("INVALID_PAYLOAD", "Invalid payload")
        );
        const res = (await PUT(makeRequest({ status: "PAID" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 401 for OrderServiceError with UNAUTHORIZED", async () => {
        vi.mocked(updateOrder).mockRejectedValueOnce(
            new OrderServiceError("UNAUTHORIZED", "Unauthorized")
        );
        const res = (await PUT(makeRequest({ status: "PAID" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(401);
    });

    it("returns 403 for OrderServiceError with NOT_ALLOWED", async () => {
        vi.mocked(updateOrder).mockRejectedValueOnce(
            new OrderServiceError("NOT_ALLOWED", "Not allowed")
        );
        const res = (await PUT(makeRequest({ status: "PAID" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(403);
    });

    it("returns 404 for OrderServiceError with NOT_FOUND", async () => {
        vi.mocked(updateOrder).mockRejectedValueOnce(
            new OrderServiceError("NOT_FOUND", "Not found")
        );
        const res = (await PUT(makeRequest({ status: "PAID" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(404);
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(updateOrder).mockRejectedValueOnce(new Error("DB down"));
        const res = (await PUT(makeRequest({ status: "PAID" }), makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to update order." });
    });
});

describe("DELETE /api/order/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 200 on successful delete", async () => {
        vi.mocked(deleteOrder).mockResolvedValueOnce(undefined as never);

        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({ message: "Order deleted successfully" });
    });

    it("calls deleteOrder with the correct id", async () => {
        vi.mocked(deleteOrder).mockResolvedValueOnce(undefined as never);

        const req = { headers: new Headers() } as unknown as Request;
        await DELETE(req, makeContext("order-xyz"));
        expect(deleteOrder).toHaveBeenCalledWith("order-xyz");
    });

    it("returns 404 for OrderServiceError with NOT_FOUND", async () => {
        vi.mocked(deleteOrder).mockRejectedValueOnce(
            new OrderServiceError("NOT_FOUND", "Order not found")
        );
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(404);
        expect(res._data).toMatchObject({ message: "Order not found" });
    });

    it("returns 403 for OrderServiceError with NOT_ALLOWED", async () => {
        vi.mocked(deleteOrder).mockRejectedValueOnce(
            new OrderServiceError("NOT_ALLOWED", "Not allowed")
        );
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(403);
    });

    it("returns 401 for OrderServiceError with UNAUTHORIZED", async () => {
        vi.mocked(deleteOrder).mockRejectedValueOnce(
            new OrderServiceError("UNAUTHORIZED", "Unauthorized")
        );
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(401);
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(deleteOrder).mockRejectedValueOnce(new Error("Unexpected"));
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("order-1"))) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to delete order." });
    });
});