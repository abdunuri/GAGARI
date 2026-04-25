import { deleteOrder, updateOrder } from "@/services/order.service";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function isOrderStatus(value: unknown): value is OrderStatus {
    return value === "PENDING" || value === "PAID" || value === "CANCELLED";
}

export async function PUT(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const hasStatus = typeof body.status !== "undefined";
        const hasTotalAmount = typeof body.totalAmount !== "undefined";
        const hasProductId = typeof body.productId !== "undefined";
        const hasQuantity = typeof body.quantity !== "undefined";

        if (!hasStatus && !hasTotalAmount && !hasProductId && !hasQuantity) {
            return NextResponse.json(
                { message: "Validation failed: provide status, totalAmount, or product quantity update." },
                { status: 400 }
            );
        }

        if (hasStatus && !isOrderStatus(body.status)) {
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
            updatePayload.status = body.status as OrderStatus;
        }

        if (hasTotalAmount) {
            const candidateTotalAmount = typeof body.totalAmount === "number" ? body.totalAmount : Number(body.totalAmount);
            if (!Number.isFinite(candidateTotalAmount) || candidateTotalAmount <= 0) {
                return NextResponse.json(
                    { message: "Validation failed: totalAmount must be a positive number." },
                    { status: 400 }
                );
            }
            updatePayload.totalAmount = candidateTotalAmount;
        }

        if (hasProductId) {
            const candidateProductId = typeof body.productId === "number" ? body.productId : Number(body.productId);
            if (!Number.isInteger(candidateProductId) || candidateProductId <= 0) {
                return NextResponse.json(
                    { message: "Validation failed: productId must be a positive integer." },
                    { status: 400 }
                );
            }
            updatePayload.productId = candidateProductId;
        }

        if (hasQuantity) {
            const candidateQuantity = typeof body.quantity === "number" ? body.quantity : Number(body.quantity);
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
        const message = error instanceof Error ? error.message : "Failed to update order.";
        const status = message.includes("not found") ? 404 : message.includes("not allowed") ? 403 : 500;
        return NextResponse.json({ message }, { status });
    }
}

export async function DELETE(_req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        await deleteOrder(id);
        return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete order.";
        const status = message.includes("not found") ? 404 : message.includes("not allowed") ? 403 : 500;
        return NextResponse.json({ message }, { status });
    }
}
