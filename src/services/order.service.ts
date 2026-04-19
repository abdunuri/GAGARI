import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


type createOrderInput = {
    customerId:number;
    orderProducts:{
        productId:number;
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
            orderProducts:{
                create:orderinput.orderProducts.map(
                    (product)=>({
                        productId :product.productId,
                        unitPrice:product.unitPrice,
                        quantity:product.quantity
                    })
                ),
                },
        },
        include:{
            orderProducts:true,
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
    const userId = session.user.id;
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    if(session.user.role === "ADMIN"||session.user.role === "OWNER"){
        const orders = await prisma.order.findMany({
            where: {
                bakeryId: Number(bakeryId),
            },
            include:{
                orderProducts:true,
                customer:true
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: (safePage - 1) * safePageSize,
            take: safePageSize
        })
        return orders
    }
    const orders = await prisma.order.findMany({
        where: {
            bakeryId: Number(bakeryId),
            createdById: userId
        },
        include:{
            orderProducts:true,
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