import { createOrder, getOrders } from "@/services/order.service";
import { NextResponse } from "next/server";

export async function POST(req:Request) {
    try {
        const body = await req.json();
        if(
            !body.customerId||
            !Array.isArray(body.orderItems)||
            body.orderItems.length===0
        ){
            return NextResponse.json(
                {message:"Missing required fields"},
                {status:400}
            );
        }

        const order = await createOrder({
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
        console.error("unable to create order",error);
        return NextResponse.json(
            {message:"failed to create the order"},
            {status:500}
        )
    }
    
}

export async function GET(req:Request){
    const orders = await getOrders();
    return NextResponse.json(
            {message:"feached all orders",orders},
            {status:200}
        )

}