import { createOrder, getOrders } from "@/services/order.service";
import { NextResponse } from "next/server";

type OrderProductInput = {
    productId: number;
    unitPrice: number;
    quantity: number;
};

type CreateOrderRequestBody = {
    customerId: number;
    bulkBatchId?: string;
    orderProducts: OrderProductInput[];
};

function isCreateOrderRequestBody(body: unknown): body is CreateOrderRequestBody {
    if (!body || typeof body !== "object") {
        return false;
    }

    const candidate = body as Partial<CreateOrderRequestBody> & {
        orderProducts?: unknown;
    };

    return (
        typeof candidate.customerId === "number" &&
        Array.isArray(candidate.orderProducts) &&
        candidate.orderProducts.every(
            (product) =>
                product !== null &&
                typeof product === "object" &&
                typeof (product as OrderProductInput).productId === "number" &&
                typeof (product as OrderProductInput).unitPrice === "number" &&
                (product as OrderProductInput).unitPrice >= 0 &&
                typeof (product as OrderProductInput).quantity === "number" &&
                (product as OrderProductInput).quantity > 0
        )
    );
}

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

export async function POST(req:Request) {
    try {
        const body: unknown = await req.json();
        if (!isCreateOrderRequestBody(body) || body.orderProducts.length === 0) {
            return NextResponse.json(
                {message:"Missing required fields"},
                {status:400}
            );
        }

        const order = await createOrder({
            customerId: body.customerId,
            bulkBatchId: typeof body.bulkBatchId === "string" ? body.bulkBatchId : undefined,
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