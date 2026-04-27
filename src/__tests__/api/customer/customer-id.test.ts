import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
    NextResponse: {
        json: (data: unknown, init?: { status?: number }) => ({
            _data: data,
            _status: init?.status ?? 200,
        }),
    },
}));

vi.mock("@/services/customer.service", () => ({
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
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

import { PUT, DELETE } from "@/app/api/customer/[id]/route";
import { updateCustomer, deleteCustomer } from "@/services/customer.service";
import { auth } from "@/lib/auth";
import { HttpError, NotFoundError, ForbiddenError } from "@/lib/errors";

type MockResponse = { _data: Record<string, unknown>; _status: number };

const mockSession = { user: { id: "user-1", bakeryId: 1 } };

function makeRequest(body: unknown): Request {
    return {
        json: () => Promise.resolve(body),
        headers: new Headers(),
    } as unknown as Request;
}

function makeContext(id: string) {
    return { params: Promise.resolve({ id }) };
}

describe("PUT /api/customer/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    });

    it("returns 401 when no session exists", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(401);
        expect(res._data).toMatchObject({ message: "Unauthorized." });
    });

    it("returns 400 for invalid customer id (non-numeric)", async () => {
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("abc"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid customer id." });
    });

    it("returns 400 for customer id of 0", async () => {
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("0"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 for negative customer id", async () => {
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("-1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when name is missing", async () => {
        const res = (await PUT(makeRequest({ phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("name must be a non-empty string");
    });

    it("returns 400 when name is empty string", async () => {
        const res = (await PUT(makeRequest({ name: "", phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when name is only whitespace", async () => {
        const res = (await PUT(makeRequest({ name: "   ", phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 400 when phoneNumber is missing", async () => {
        const res = (await PUT(makeRequest({ name: "Alice" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data.message).toContain("phoneNumber must be a non-empty string");
    });

    it("returns 400 when phoneNumber is empty string", async () => {
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 200 on successful update", async () => {
        const mockCustomer = { id: 1, name: "Alice", phoneNumber: "555-1234" };
        vi.mocked(updateCustomer).mockResolvedValueOnce(mockCustomer as never);

        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "555-1234" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({
            message: "Customer updated successfully",
            customer: mockCustomer,
        });
    });

    it("calls updateCustomer with trimmed name and phone", async () => {
        vi.mocked(updateCustomer).mockResolvedValueOnce({ id: 1 } as never);
        await PUT(makeRequest({ name: "  Bob  ", phoneNumber: "  123-456  " }), makeContext("1"));
        expect(updateCustomer).toHaveBeenCalledWith(1, {
            name: "Bob",
            phoneNumber: "123-456",
        });
    });

    it("returns the HttpError status when service throws NotFoundError", async () => {
        vi.mocked(updateCustomer).mockRejectedValueOnce(
            new NotFoundError("Customer not found.")
        );
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(404);
        expect(res._data).toMatchObject({ message: "Customer not found." });
    });

    it("returns the HttpError status when service throws ForbiddenError", async () => {
        vi.mocked(updateCustomer).mockRejectedValueOnce(
            new ForbiddenError("You are not allowed to update this customer.")
        );
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(403);
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(updateCustomer).mockRejectedValueOnce(new Error("DB error"));
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to update customer." });
    });

    it("returns 500 when HttpError is not involved and arbitrary error thrown", async () => {
        vi.mocked(updateCustomer).mockRejectedValueOnce("string error");
        const res = (await PUT(makeRequest({ name: "Alice", phoneNumber: "123" }), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(500);
    });
});

describe("DELETE /api/customer/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    });

    it("returns 401 when no session exists", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
        const res = (await DELETE(makeRequest(null), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(401);
        expect(res._data).toMatchObject({ message: "Unauthorized." });
    });

    it("returns 400 for invalid customer id", async () => {
        const res = (await DELETE(makeRequest(null), makeContext("not-a-number"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
        expect(res._data).toMatchObject({ message: "Invalid customer id." });
    });

    it("returns 400 for customer id of 0", async () => {
        const res = (await DELETE(makeRequest(null), makeContext("0"))) as unknown as MockResponse;
        expect(res._status).toBe(400);
    });

    it("returns 200 on successful delete", async () => {
        vi.mocked(deleteCustomer).mockResolvedValueOnce(undefined as never);
        const res = (await DELETE(makeRequest(null), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(200);
        expect(res._data).toMatchObject({ message: "Customer deleted successfully" });
    });

    it("calls deleteCustomer with the correct id", async () => {
        vi.mocked(deleteCustomer).mockResolvedValueOnce(undefined as never);
        await DELETE(makeRequest(null), makeContext("42"));
        expect(deleteCustomer).toHaveBeenCalledWith(42);
    });

    it("returns 404 when service throws NotFoundError", async () => {
        vi.mocked(deleteCustomer).mockRejectedValueOnce(new NotFoundError("Customer not found."));
        const res = (await DELETE(makeRequest(null), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(404);
    });

    it("returns 403 when service throws ForbiddenError", async () => {
        vi.mocked(deleteCustomer).mockRejectedValueOnce(
            new ForbiddenError("You are not allowed to delete this customer.")
        );
        const res = (await DELETE(makeRequest(null), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(403);
        expect(res._data).toMatchObject({ message: "You are not allowed to delete this customer." });
    });

    it("returns the exact status from any HttpError subclass", async () => {
        vi.mocked(deleteCustomer).mockRejectedValueOnce(new HttpError(422, "Unprocessable entity"));
        const res = (await DELETE(makeRequest(null), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(422);
    });

    it("returns 500 for unexpected errors", async () => {
        vi.mocked(deleteCustomer).mockRejectedValueOnce(new Error("Database failure"));
        const res = (await DELETE(makeRequest(null), makeContext("1"))) as unknown as MockResponse;
        expect(res._status).toBe(500);
        expect(res._data).toMatchObject({ message: "Failed to delete customer." });
    });
});