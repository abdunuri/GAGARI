import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"


type newCustomerInfo = {
    name:string,
    phoneNumber:string}

async function createCustomer(newCustomerInfo:newCustomerInfo){
    const session = await auth.api.getSession({
        headers:await headers()
    })
    if(!session){
        console.log("login required")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }

    const createdById = session.user.id;
    const bakeryId = Number(session.user.bakeryId);
    if (isNaN(bakeryId)) {
        throw new Error("Invalid bakeryId in session");
    }    const customer = await prisma.customer.create({
        data:{
            createdById:createdById,
            name:newCustomerInfo.name,
            bakeryId:bakeryId,
            phoneNumber:newCustomerInfo.phoneNumber,

        },
    });
    return customer;
}
async function getCustomer() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) {
        console.log("login required");
        redirect(`${process.env["BETTER_AUTH_URL"]}/login`);
    }

    const bakeryId = Number(session.user.bakeryId);
    const userId = session.user.id;
    if(session.user.role === "ADMIN"||session.user.role === "OWNER"){
        const customers = await prisma.customer.findMany({
            where: {
                bakeryId: bakeryId
            },
            include:{
                bakery:true
            }
        });
        return customers;
    }

    const customers = await prisma.customer.findMany({
        where: {
            bakeryId: bakeryId,
            createdById: userId
        },
        include:{
            bakery:true
        }
    });

    return customers
}

export {createCustomer,getCustomer}