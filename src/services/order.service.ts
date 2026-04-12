import { prisma } from "@/lib/prisma";


type creatOrderInput = {
    createdById:number;
    bakeryId:number;
    customerId:number;
    orderItems:{
        itemId:number;
        unitPrice:number;
        quantity:number
    }[];
};
async function createOrder(orderinput:creatOrderInput) {
    const order = await prisma.order.create({
        data:{
            createdById:orderinput.createdById,
            bakeryId:orderinput.bakeryId,
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
            orderItems:true
        }
    });
    return order;
    
};

async function getOrders() {
    const orders = await prisma.order.findMany(
        {
            include:{
                orderItems:true,
                customer:true
            }
        }
    )
    return orders
};

export {createOrder ,getOrders};