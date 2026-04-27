import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
    NextResponse: {
        json: (data: unknown, init?: { status?: number }) => ({
            _data: data,
            _status: init?.status ?? 200,
        }),
    },
}));

vi.mock("@/services/product.service", () => ({
    UpdateProduct: vi.fn(),
    DeleteProduct: vi.fn(),
}));

vi.mock("@/lib/errors", async () => {
    const HttpError = class extends Error {
        status: number;
        constructor(status: number, message: string) {
            super(message);
            this.name = "HttpError";
            this.status = status;
        }
    };
    const NotFoundError = class extends HttpError {
        constructor(message: string) { super(404, message); this.name = "NotFoundError"; }
    };
    const ForbiddenError = class extends HttpError {
        constructor(message: string) { super(403, message); this.name = "ForbiddenError"; }
    };
    const ConflictError = class extends HttpError {
        constructor(message: string) { super(409, message); this.name = "ConflictError"; }
    };

    return { HttpError, NotFoundError, ForbiddenError, ConflictError };
});

import { PUT, DELETE } from "@/app/api/product/[id]/route";
import { UpdateProduct, DeleteProduct } from "@/services/product.service";
import { HttpError, NotFoundError, ForbiddenError, ConflictError } from "@/lib/errors";

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

describe("PUT /api/product/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 for invalid product id (non-numeric)", async () => {
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 2 }), makeContext("abc"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid product id." });
    });

    it("returns 400 for product id of 0", async () => {
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 2 }), makeContext("0"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 for negative product id", async () => {
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 2 }), makeContext("-5"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 for invalid JSON body", async () => {
        const res = (await PUT(makeRequest(null, true), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid JSON payload." });
    });

    it("returns 400 when body is an array", async () => {
        const res = (await PUT(makeRequest([1, 2, 3]), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("JSON object");
    });

    it("returns 400 when name is missing", async () => {
        const res = (await PUT(makeRequest({ category: "BREAD", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("name must be a non-empty string");
    });

    it("returns 400 when name is empty string", async () => {
        const res = (await PUT(makeRequest({ name: "", category: "BREAD", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when name is only whitespace", async () => {
        const res = (await PUT(makeRequest({ name: "   ", category: "BREAD", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when category is invalid", async () => {
        const res = (await PUT(makeRequest({ name: "Sourdough", category: "INVALID", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("BREAD, FASTF, CAKE");
    });

    it("returns 400 when category is missing", async () => {
        const res = (await PUT(makeRequest({ name: "Sourdough", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("accepts BREAD as a valid category", async () => {
        vi.mocked(UpdateProduct).mockResolvedValueOnce({ id: 1 } as never);
        const res = (await PUT(makeRequest({ name: "Sourdough", category: "BREAD", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
    });

    it("accepts FASTF as a valid category", async () => {
        vi.mocked(UpdateProduct).mockResolvedValueOnce({ id: 1 } as never);
        const res = (await PUT(makeRequest({ name: "Burger", category: "FASTF", price: 5 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
    });

    it("accepts CAKE as a valid category", async () => {
        vi.mocked(UpdateProduct).mockResolvedValueOnce({ id: 1 } as never);
        const res = (await PUT(makeRequest({ name: "Chocolate Cake", category: "CAKE", price: 15 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
    });

    it("returns 400 when price is 0", async () => {
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 0 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("price must be a positive number");
    });

    it("returns 400 when price is negative", async () => {
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: -1 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when price is NaN string", async () => {
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: "abc" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("parses price from numeric string", async () => {
        vi.mocked(UpdateProduct).mockResolvedValueOnce({ id: 1 } as never);
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: "5.5" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(UpdateProduct).toHaveBeenCalledWith(1, expect.objectContaining({ price: 5.5 }));
    });

    it("returns 200 on successful update", async () => {
        const mockProduct = { id: 1, name: "Sourdough", category: "BREAD", price: 3.5 };
        vi.mocked(UpdateProduct).mockResolvedValueOnce(mockProduct as never);

        const res = (await PUT(makeRequest({ name: "Sourdough", category: "BREAD", price: 3.5 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({ message: "Product updated successfully", product: mockProduct });
    });

    it("trims whitespace from name before calling service", async () => {
        vi.mocked(UpdateProduct).mockResolvedValueOnce({ id: 1 } as never);
        await PUT(makeRequest({ name: "  Baguette  ", category: "BREAD", price: 2 }), makeContext("1"));
        expect(UpdateProduct).toHaveBeenCalledWith(1, expect.objectContaining({ name: "Baguette" }));
    });

    it("calls UpdateProduct with the correct product id", async () => {
        vi.mocked(UpdateProduct).mockResolvedValueOnce({ id: 42 } as never);
        await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 2 }), makeContext("42"));
        expect(UpdateProduct).toHaveBeenCalledWith(42, expect.any(Object));
    });

    it("returns the HttpError status when service throws NotFoundError", async () => {
        vi.mocked(UpdateProduct).mockRejectedValueOnce(new NotFoundError("Product not found."));
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(404);
        expect(res._data).toMatchObject({ message: "Product not found." });
    });

    it("returns 403 when service throws ForbiddenError", async () => {
        vi.mocked(UpdateProduct).mockRejectedValueOnce(new ForbiddenError("Not allowed."));
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(403);
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(UpdateProduct).mockRejectedValueOnce(new Error("DB failure"));
        const res = (await PUT(makeRequest({ name: "Bread", category: "BREAD", price: 2 }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to update product." });
    });
});

describe("DELETE /api/product/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 for invalid product id", async () => {
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("bad"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid product id." });
    });

    it("returns 400 for product id of 0", async () => {
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("0"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 200 on successful delete", async () => {
        vi.mocked(DeleteProduct).mockResolvedValueOnce(undefined as never);
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({ message: "Product deleted successfully" });
    });

    it("calls DeleteProduct with the correct product id", async () => {
        vi.mocked(DeleteProduct).mockResolvedValueOnce(undefined as never);
        const req = { headers: new Headers() } as unknown as Request;
        await DELETE(req, makeContext("7"));
        expect(DeleteProduct).toHaveBeenCalledWith(7);
    });

    it("returns 404 when service throws NotFoundError", async () => {
        vi.mocked(DeleteProduct).mockRejectedValueOnce(new NotFoundError("Product not found."));
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(404);
    });

    it("returns 403 when service throws ForbiddenError", async () => {
        vi.mocked(DeleteProduct).mockRejectedValueOnce(new ForbiddenError("Not allowed."));
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(403);
    });

    it("returns 409 when service throws ConflictError", async () => {
        vi.mocked(DeleteProduct).mockRejectedValueOnce(new ConflictError("Product cannot be deleted."));
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(409);
        expect(res._data).toMatchObject({ message: "Product cannot be deleted." });
    });

    it("returns exact HttpError status for any HttpError subclass", async () => {
        vi.mocked(DeleteProduct).mockRejectedValueOnce(new HttpError(422, "Unprocessable."));
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(422);
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(DeleteProduct).mockRejectedValueOnce(new Error("Connection lost"));
        const req = { headers: new Headers() } as unknown as Request;
        const res = (await DELETE(req, makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to delete product." });
    });
});