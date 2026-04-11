import { prisma } from "@/lib/prisma";

async function createOrder() {
    const order = await prisma.order.create({
        data:{
            userId:1,
            customerId:1,
            orderItems:{
                create:[
                    {
                        itemId:1,
                        unitPrice:10,
                        quantity:20

                    },
                    {
                        itemId:2,
                        unitPrice:20,
                        quantity:10
                    }
                ]
            }
        },
        include:{
            orderItems:true
        }
    })
    console.log("order created: ",order)
    
}

export {createOrder}