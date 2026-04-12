import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

async function createUser() {
    const User = await prisma.user.create({
        data:{
            name:"Abdulaziz",
            username:"abdunuri",
            password:"anbu123",
            role:$Enums.Role.ADMIN
        }
    })
    console.log("user created: ",User);
    const allUsers = await prisma.user.findMany();
    console.log(allUsers)
}

async function createOrder() {
    const order = await prisma.order.create({
        data:{
            createdById:9,
            customerId:5,
            bakeryId:5,
        },
        include:{
            orderItems:true

    }}
    )
}
// createOrder().then (async() => { await prisma.$disconnect()})
//     .catch(async(e) =>{
//         console.log(e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });

createOrder()