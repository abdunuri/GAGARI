import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


type createOrderInput = {
    customerId:number;
    orderItems:{
        itemId:number;
        unitPrice:number;
        quantity:number
    }[];
};
async function createOrder(orderinput:createOrderInput) {
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        redirect(`${process.env["BETTER_AUTH_URL"]}/login`)    }
    const createdById = session.user.id;
    const bakeryId   = session.user.bakeryId;
    const order = await prisma.order.create({
        data:{
            createdById:createdById,
            bakeryId:Number(bakeryId),
            customerId:orderinput.customerId,
            orderItems:{
                create:orderinput.orderItems.map(
                    (item)=>({
                        itemId :item.itemId,
                        unitPrice:item.unitPrice,
                        quantity:item.quantity
                    })
                ),
                },
        },
        include:{
            orderItems:true,
            customer:true
        }
    });
    return order;
    
};

async function getOrders(page = 1, pageSize = 20) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect(`${process.env["BETTER_AUTH_URL"]}+/login`)
    }

    const bakeryId = session.user.bakeryId;
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    const orders = await prisma.order.findMany({
        where: {
            bakeryId: Number(bakeryId)
        },
        include:{
            orderItems:true,
            customer:true
        },
        orderBy: {
            createdAt: "desc"
        },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize
    })
    return orders
};

export {createOrder ,getOrders};