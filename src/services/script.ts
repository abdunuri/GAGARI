import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";

console.log('DATABASE_URL =', process.env.DATABASE_URL)

async function main() {
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
main().then (async() => { await prisma.$disconnect()})
    .catch(async(e) =>{
        console.log(e);
        await prisma.$disconnect();
        process.exit(1);
    });