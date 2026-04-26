import { auth } from "@/lib/auth"
import { ForbiddenError, NotFoundError } from "@/lib/errors"
import { getLoginRedirectUrl, parseBakeryId } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"


type newCustomerInfo = {
    name:string,
    phoneNumber:string}

type updateCustomerInfo = {
    name: string;
    phoneNumber: string;
}

type CustomerActor = {
    id: string;
    role: string | null | undefined;
    bakeryId?: string | number | null | undefined;
}

async function getAuthorizedCustomer(
    customerId: number,
    requestHeaders: Awaited<ReturnType<typeof headers>>,
    action: "update" | "delete"
): Promise<{ customer: { id: number; createdById: string }; actor: CustomerActor }> {
    const session = await auth.api.getSession({
        headers: requestHeaders,
    });

    if (!session) {
        redirect(getLoginRedirectUrl());
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new Error("Invalid bakeryId in session");
    }

    const customer = await prisma.customer.findFirst({
        where: {
            id: customerId,
            bakeryId,
            isActive: true,
        },
        select: {
            id: true,
            createdById: true,
        },
    });

    if (!customer) {
        throw new NotFoundError("Customer not found in this bakery.");
    }

    const actor: CustomerActor = {
        id: session.user.id,
        role: session.user.role,
        bakeryId: session.user.bakeryId,
    };

    const canManageAnyCustomer = actor.role === "ADMIN" || actor.role === "OWNER";
    if (!canManageAnyCustomer && customer.createdById !== actor.id) {
        throw new ForbiddenError(
            action === "update"
                ? "You are not allowed to update this customer."
                : "You are not allowed to delete this customer."
        );
    }

    return { customer, actor };
}

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
        redirect(getLoginRedirectUrl());
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    const userId = session.user.id;
    if (!bakeryId) {
        throw new Error("Invalid bakeryId in session");
    }
    if(session.user.role === "ADMIN"||session.user.role === "OWNER"){
        const customers = await prisma.customer.findMany({
            where: {
                bakeryId,
                isActive: true,
            },
            include:{
                bakery:true
            }
        });
        return customers;
    }

    const customers = await prisma.customer.findMany({
        where: {
            bakeryId,
            createdById: userId,
            isActive: true,
        },
        include:{
            bakery:true
        }
    });

    return customers
}

async function updateCustomer(customerId: number, updateInfo: updateCustomerInfo) {
    const { customer } = await getAuthorizedCustomer(customerId, await headers(), "update");
    return prisma.customer.update({
        where: { id: customer.id },
        data: {
            name: updateInfo.name,
            phoneNumber: updateInfo.phoneNumber,
        },
    });
}

async function deleteCustomer(customerId: number) {
    const { customer } = await getAuthorizedCustomer(customerId, await headers(), "delete");
    return prisma.customer.update({
        where: { id: customer.id },
        data: {
            isActive: false,
        },
    });
}

export {createCustomer,getCustomer,updateCustomer,deleteCustomer}