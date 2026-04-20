import { createOrder, getOrders } from "@/services/order.service";
import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try {
        const body = await req.json();
        if(
            !body.customerId||
            !Array.isArray(body.orderProducts)||
            body.orderProducts.length===0
        ){
            return NextResponse.json(
                {message:"Missing required fields"},
                {status:400}
            );
        }

        const invalidProduct = body.orderProducts.some(
            (product: any) =>
                !product.productId ||
                typeof product.unitPrice !== "number" ||
                product.unitPrice < 0 ||
                typeof product.quantity !== "number" ||
                product.quantity <= 0
        );
        if (invalidProduct) {
            return NextResponse.json(
                { message: "Invalid order product data" },
                { status: 400 }
            );
        }
        const order = await createOrder({
            customerId:body.customerId,
            bulkBatchId: typeof body.bulkBatchId === "string" ? body.bulkBatchId : undefined,
            orderProducts:body.orderProducts.map((product:any)=>({
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
            {message:"failed to create the order"},
            {status:500}
        )
    }
    
}

export async function GET(req:Request){
    try {
        const orders = await getOrders();
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