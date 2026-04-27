import { createOrder, getOrders, OrderServiceError } from "@/services/order.service";
import { NextResponse } from "next/server";
import { isCreateOrderRequestBody } from "./validators";

function isClientOrderError(error: unknown) {
    if (!(error instanceof Error)) {
        return false;
    }

    return [
        "Your account is not linked to a bakery.",
        "Customer not found in this bakery.",
        "One or more products do not belong to this bakery.",
    ].includes(error.message);
}

function isPositiveInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function getOrderErrorStatus(error: OrderServiceError) {
    switch (error.code) {
        case "INVALID_PAYLOAD":
            return 400;
        case "UNAUTHORIZED":
            return 401;
        case "NOT_ALLOWED":
            return 403;
        case "NOT_FOUND":
        case "PRODUCT_NOT_IN_ORDER":
            return 404;
        default:
            return 500;
    }
}

export async function POST(req:Request) {
    try {
        const body: unknown = await req.json();
        if (!isCreateOrderRequestBody(body) || body.orderProducts.length === 0) {
            return NextResponse.json(
                {message:"Missing required fields"},
                {status:400}
            );
        }

        if (typeof body.bulkExpectedCount !== "undefined" && !isPositiveInteger(body.bulkExpectedCount)) {
            return NextResponse.json(
                { message: "Validation failed: bulkExpectedCount must be a positive integer when provided." },
                { status: 400 }
            );
        }

        const order = await createOrder({
            customerId: body.customerId,
            bulkBatchId: typeof body.bulkBatchId === "string" ? body.bulkBatchId : undefined,
            bulkExpectedCount: body.bulkExpectedCount,
            orderProducts: body.orderProducts.map((product) => ({
                productId:product.productId,
                unitPrice:product.unitPrice,
                quantity:product.quantity
            }))
        })

        return NextResponse.json(
            {message:"order created successfully",order},
            {status:201}
        );
    } catch (error) {
        if (error instanceof OrderServiceError) {
            return NextResponse.json(
                { message: error.message },
                { status: getOrderErrorStatus(error) }
            );
        }

        console.error("unable to create order",error);
        return NextResponse.json(
            {message:error instanceof Error ? error.message : "failed to create the order"},
            {status:isClientOrderError(error) ? 400 : 500}
        )
    }
    
}

export async function GET(req:Request){
    try {
        const url = new URL(req.url);
        const page = Number(url.searchParams.get("page") ?? "1");
        const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
        const orders = await getOrders(
            Number.isFinite(page) ? page : 1,
            Number.isFinite(pageSize) ? pageSize : 20
        );
        return NextResponse.json(
            { message: "fetched all orders", orders },
            { status: 200 }
        )
    } catch (error) {
        console.error("Failed to fetch orders", error);
        return NextResponse.json(
            { message: "Failed to fetch orders" },
            { status: 500 }
        )
    }

}
