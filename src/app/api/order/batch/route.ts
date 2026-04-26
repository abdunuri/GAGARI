import { createOrdersBatch, OrderServiceError } from "@/services/order.service";
import { NextResponse } from "next/server";

type OrderProductInput = {
    productId: number;
    unitPrice: number;
    quantity: number;
};

type BatchOrderInput = {
    customerId: number;
    orderProducts: OrderProductInput[];
};

type CreateOrdersBatchRequestBody = {
    bulkBatchId: string;
    bulkExpectedCount: number;
    orders: BatchOrderInput[];
};

function isPositiveInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function getOrderErrorStatus(error: OrderServiceError) {
    switch (error.code) {
        case "INVALID_PAYLOAD":
            return 400;
        case "PRODUCT_NOT_IN_ORDER":
            return 400;
        case "UNAUTHORIZED":
            return 401;
        case "NOT_ALLOWED":
            return 403;
        case "NOT_FOUND":
            return 404;
        default:
            return 500;
    }
}

function isBatchOrderInput(value: unknown): value is BatchOrderInput {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const candidate = value as Partial<BatchOrderInput> & { orderProducts?: unknown };

    return (
        isPositiveInteger(candidate.customerId) &&
        Array.isArray(candidate.orderProducts) &&
        candidate.orderProducts.every(
            (product) =>
                product !== null &&
                typeof product === "object" &&
                isPositiveInteger((product as OrderProductInput).productId) &&
                typeof (product as OrderProductInput).unitPrice === "number" &&
                (product as OrderProductInput).unitPrice >= 0 &&
                isPositiveInteger((product as OrderProductInput).quantity)
        )
    );
}

export async function POST(req: Request) {
    try {
        let rawBody: unknown;

        try {
            rawBody = await req.json();
        } catch {
            return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
        }

        if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
            return NextResponse.json({ message: "Validation failed: payload must be a JSON object." }, { status: 400 });
        }

        const body = rawBody as Partial<CreateOrdersBatchRequestBody> & { orders?: unknown };

        if (
            typeof body.bulkBatchId !== "string" ||
            !body.bulkBatchId.trim() ||
            !isPositiveInteger(body.bulkExpectedCount) ||
            !Array.isArray(body.orders) ||
            body.orders.length === 0 ||
            !body.orders.every(isBatchOrderInput)
        ) {
            return NextResponse.json(
                { message: "Validation failed: provide a batch id, expected count, and at least one valid order." },
                { status: 400 }
            );
        }

        const orders = await createOrdersBatch({
            bulkBatchId: body.bulkBatchId.trim(),
            bulkExpectedCount: body.bulkExpectedCount,
            orders: body.orders,
        });

        return NextResponse.json(
            { message: `Created ${orders.length} order${orders.length > 1 ? "s" : ""} successfully`, orders },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof OrderServiceError) {
            return NextResponse.json({ message: error.message }, { status: getOrderErrorStatus(error) });
        }

        console.error("Failed to create batch orders", error);
        return NextResponse.json({ message: "Failed to create batch orders." }, { status: 500 });
    }
}