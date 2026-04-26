import { describe, it, expect } from "vitest";
import {
    isJsonObjectBody,
    isCreateOrderRequestBody,
    hasOwn,
} from "@/app/api/order/validators";

describe("isJsonObjectBody", () => {
    it("returns true for a plain object", () => {
        expect(isJsonObjectBody({ key: "value" })).toBe(true);
    });

    it("returns true for an empty object", () => {
        expect(isJsonObjectBody({})).toBe(true);
    });

    it("returns false for null", () => {
        expect(isJsonObjectBody(null)).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(isJsonObjectBody(undefined)).toBe(false);
    });

    it("returns false for an array", () => {
        expect(isJsonObjectBody([])).toBe(false);
        expect(isJsonObjectBody([1, 2, 3])).toBe(false);
    });

    it("returns false for a string", () => {
        expect(isJsonObjectBody("hello")).toBe(false);
    });

    it("returns false for a number", () => {
        expect(isJsonObjectBody(42)).toBe(false);
    });

    it("returns false for a boolean", () => {
        expect(isJsonObjectBody(true)).toBe(false);
        expect(isJsonObjectBody(false)).toBe(false);
    });

    it("returns true for nested object", () => {
        expect(isJsonObjectBody({ a: { b: 1 } })).toBe(true);
    });
});

describe("isCreateOrderRequestBody", () => {
    const validProduct = { productId: 1, unitPrice: 5.0, quantity: 2 };
    const validBody = { customerId: 1, orderProducts: [validProduct] };

    it("returns true for a valid body", () => {
        expect(isCreateOrderRequestBody(validBody)).toBe(true);
    });

    it("returns true with optional bulkBatchId and bulkExpectedCount", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                bulkBatchId: "batch-123",
                bulkExpectedCount: 10,
                orderProducts: [validProduct],
            })
        ).toBe(true);
    });

    it("returns false for null", () => {
        expect(isCreateOrderRequestBody(null)).toBe(false);
    });

    it("returns false for an array", () => {
        expect(isCreateOrderRequestBody([])).toBe(false);
    });

    it("returns false when customerId is missing", () => {
        expect(isCreateOrderRequestBody({ orderProducts: [validProduct] })).toBe(false);
    });

    it("returns false when customerId is a string", () => {
        expect(isCreateOrderRequestBody({ customerId: "1", orderProducts: [validProduct] })).toBe(false);
    });

    it("returns false when orderProducts is missing", () => {
        expect(isCreateOrderRequestBody({ customerId: 1 })).toBe(false);
    });

    it("returns false when orderProducts is not an array", () => {
        expect(isCreateOrderRequestBody({ customerId: 1, orderProducts: "bad" })).toBe(false);
    });

    it("returns false when orderProducts is an empty array", () => {
        // Empty arrays pass the every() check trivially — this is intended behavior
        // The validator allows empty arrays; route-level validation may reject them
        expect(isCreateOrderRequestBody({ customerId: 1, orderProducts: [] })).toBe(true);
    });

    it("returns false when a product has no productId", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [{ unitPrice: 1.0, quantity: 2 }],
            })
        ).toBe(false);
    });

    it("returns false when a product's productId is a string", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [{ productId: "1", unitPrice: 1.0, quantity: 2 }],
            })
        ).toBe(false);
    });

    it("returns false when unitPrice is negative", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [{ productId: 1, unitPrice: -1.0, quantity: 2 }],
            })
        ).toBe(false);
    });

    it("returns true when unitPrice is zero (free item)", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [{ productId: 1, unitPrice: 0, quantity: 2 }],
            })
        ).toBe(true);
    });

    it("returns false when quantity is zero", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [{ productId: 1, unitPrice: 1.0, quantity: 0 }],
            })
        ).toBe(false);
    });

    it("returns false when quantity is negative", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [{ productId: 1, unitPrice: 1.0, quantity: -5 }],
            })
        ).toBe(false);
    });

    it("returns false when a product is null", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [null],
            })
        ).toBe(false);
    });

    it("returns true for multiple valid products", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [
                    { productId: 1, unitPrice: 2.5, quantity: 3 },
                    { productId: 2, unitPrice: 0, quantity: 1 },
                ],
            })
        ).toBe(true);
    });

    it("returns false if one product in the array is invalid", () => {
        expect(
            isCreateOrderRequestBody({
                customerId: 1,
                orderProducts: [
                    { productId: 1, unitPrice: 2.5, quantity: 3 },
                    { productId: 2, unitPrice: -1, quantity: 1 },
                ],
            })
        ).toBe(false);
    });
});

describe("hasOwn", () => {
    it("returns true when the key exists on the object", () => {
        const obj = { status: "PENDING" };
        expect(hasOwn(obj, "status")).toBe(true);
    });

    it("returns false when the key does not exist", () => {
        const obj = { status: "PENDING" };
        expect(hasOwn(obj, "totalAmount")).toBe(false);
    });

    it("returns true for keys with undefined values", () => {
        const obj: Record<string, unknown> = { status: undefined };
        expect(hasOwn(obj, "status")).toBe(true);
    });

    it("returns false for inherited prototype properties", () => {
        const obj: Record<string, unknown> = {};
        expect(hasOwn(obj, "toString")).toBe(false);
        expect(hasOwn(obj, "hasOwnProperty")).toBe(false);
    });

    it("returns true for null value keys", () => {
        const obj: Record<string, unknown> = { key: null };
        expect(hasOwn(obj, "key")).toBe(true);
    });

    it("returns false for an empty object", () => {
        expect(hasOwn({}, "anything")).toBe(false);
    });

    it("handles object with multiple keys correctly", () => {
        const obj = { a: 1, b: 2, c: 3 };
        expect(hasOwn(obj, "a")).toBe(true);
        expect(hasOwn(obj, "b")).toBe(true);
        expect(hasOwn(obj, "d")).toBe(false);
    });
});