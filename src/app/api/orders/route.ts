import { createOrder, getOrders } from "@/services/order.service";
import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try {
        const body = await req.json();
        if(
            !body.createdById||
            !body.customerId||
            !body.bakeryId||
            !Array.isArray(body.orderItems)||
            body.orderItems.length===0
        ){
            return NextResponse.json(
                {message:"Missing required fields"},
                {status:400}
            );
        }

        const order = await createOrder({
            createdById:body.createdById,
            bakeryId:body.bakeryId,
            customerId:body.customerId,
            orderItems:body.orderItems.map((item:any)=>({
                itemId:item.itemId,
                unitPrice:item.unitPrice,
                quantity:item.quantity
            }))
        })

        return NextResponse.json(
            {message:"order created successfully"},
            {status:201}
        );
    } catch (error) {
        console.error("unable to create order");
        return NextResponse.json(
            {message:"failed to create the order"},
            {status:500}
        )
    }
    
}
