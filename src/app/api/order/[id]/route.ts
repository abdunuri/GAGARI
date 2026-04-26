import { deleteOrder, OrderServiceError, updateOrder } from "@/services/order.service";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function isOrderStatus(value: unknown): value is OrderStatus {
    return value === "PENDING" || value === "PAID" || value === "CANCELLED";
}

function hasOwn(payload: Record<string, unknown>, key: string) {
    return Object.prototype.hasOwnProperty.call(payload, key);
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

export async function PUT(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        let rawBody: unknown;
        try {
            rawBody = await req.json();
        } catch {
            return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
        }

        if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
            return NextResponse.json(
                { message: "Validation failed: payload must be a JSON object." },
                { status: 400 }
            );
        }

        const body = rawBody as Record<string, unknown>;

        const hasStatus = hasOwn(body, "status");
        const hasTotalAmount = hasOwn(body, "totalAmount");
        const hasProductId = hasOwn(body, "productId");
        const hasQuantity = hasOwn(body, "quantity");

        if (!hasStatus && !hasTotalAmount && !hasProductId && !hasQuantity) {
            return NextResponse.json(
                { message: "Validation failed: provide status, totalAmount, or product quantity update." },
                { status: 400 }
            );
        }

        if ((hasProductId && !hasQuantity) || (hasQuantity && !hasProductId)) {
            return NextResponse.json(
                {
                    message: "Both productId and quantity must be provided together for product updates.",
                },
                { status: 400 }
            );
        }

        if (hasStatus && !isOrderStatus(body["status"])) {
            return NextResponse.json(
                { message: "Validation failed: status must be one of PENDING, PAID, CANCELLED." },
                { status: 400 }
            );
        }

        const updatePayload: {
            status?: OrderStatus;
            totalAmount?: number;
            productId?: number;
            quantity?: number;
        } = {};

        if (hasStatus) {
            updatePayload.status = body["status"] as OrderStatus;
        }

        if (hasTotalAmount) {
            const totalAmountValue = body["totalAmount"];
            const candidateTotalAmount = typeof totalAmountValue === "number" ? totalAmountValue : Number(totalAmountValue);
            if (!Number.isFinite(candidateTotalAmount) || candidateTotalAmount <= 0) {
                return NextResponse.json(
                    { message: "Validation failed: totalAmount must be a positive number." },
                    { status: 400 }
                );
            }
            updatePayload.totalAmount = candidateTotalAmount;
        }

        if (hasProductId) {
            const productIdValue = body["productId"];
            const candidateProductId = typeof productIdValue === "number" ? productIdValue : Number(productIdValue);
            if (!Number.isInteger(candidateProductId) || candidateProductId <= 0) {
                return NextResponse.json(
                    { message: "Validation failed: productId must be a positive integer." },
                    { status: 400 }
                );
            }
            updatePayload.productId = candidateProductId;
        }

        if (hasQuantity) {
            const quantityValue = body["quantity"];
            const candidateQuantity = typeof quantityValue === "number" ? quantityValue : Number(quantityValue);
            if (!Number.isInteger(candidateQuantity) || candidateQuantity <= 0) {
                return NextResponse.json(
                    { message: "Validation failed: quantity must be a positive integer." },
                    { status: 400 }
                );
            }
            updatePayload.quantity = candidateQuantity;
        }

        const order = await updateOrder(id, updatePayload);
        return NextResponse.json({ message: "Order updated successfully", order }, { status: 200 });
    } catch (error) {
        if (error instanceof OrderServiceError) {
            return NextResponse.json({ message: error.message }, { status: getOrderErrorStatus(error) });
        }

        return NextResponse.json({ message: "Failed to update order." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        await deleteOrder(id);
        return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof OrderServiceError) {
            return NextResponse.json({ message: error.message }, { status: getOrderErrorStatus(error) });
        }

        return NextResponse.json({ message: "Failed to delete order." }, { status: 500 });
    }
}
