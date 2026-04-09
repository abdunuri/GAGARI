import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

console.log('DATABASE_URL =', process.env.DATABASE_URL)

async function createUser() {
    const User = await prisma.user.create({
        data:{
            name:"Abdulber",
            username:"abduber",
            password:"abdulber123",
            role:$Enums.Role.OWNER
        }
    })
    console.log("user created: ",User);
    const allUsers = await prisma.user.findMany();
    console.log(allUsers)
}

async function createOrder() {
    const order = await prisma.order.create({
        data:{
            userId:1,
            customerId :1   
        }
    }
    )
    console.log("order created",order);
    const allorder = await prisma.order.findMany()
    console.log(allorder)
}
createOrder().then (async() => { await prisma.$disconnect()})
    .catch(async(e) =>{
        console.log(e);
        await prisma.$disconnect();
        process.exit(1);
    });