import { auth } from "@/lib/auth"
import { CACHE_TAGS, expireCache, readThroughCache } from "@/lib/data-cache"
import { ForbiddenError, NotFoundError } from "@/lib/errors"
import { getCurrentSession } from "@/lib/auth-session"
import { getLoginRedirectUrl, parseBakeryId } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { unstable_cache } from "next/cache"
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

function assertCanMutateCustomers(role: string | null | undefined) {
    if (role === "VIEWER") {
        throw new ForbiddenError("Viewers are not allowed to modify customers.");
    }
}

const queryCustomersByAccess = async (bakeryId: number, userId: string, canManageAnyCustomer: boolean) => {
    return prisma.customer.findMany({
        where: {
            bakeryId,
            ...(canManageAnyCustomer ? {} : { createdById: userId }),
            isActive: true,
        },
        include: {
            bakery: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};

const getCachedCustomersByAccess = unstable_cache(
    queryCustomersByAccess,
    ["customers-by-access"],
    {
        tags: [CACHE_TAGS.customers],
        revalidate: 60,
    }
);

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
    assertCanMutateCustomers(actor.role);

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
    const session = await getCurrentSession()
    if(!session){
        console.log("login required")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }
    assertCanMutateCustomers(session.user.role);

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
    expireCache([CACHE_TAGS.customers, CACHE_TAGS.dashboard, CACHE_TAGS.admin], ["/customers", "/orders/new", "/dashboard", "/Admin"]);

    return customer;
}
async function getCustomer() {
    const session = await getCurrentSession();
    if (!session) {
        console.log("login required");
        redirect(getLoginRedirectUrl());
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    const userId = session.user.id;
    if (!bakeryId) {
        throw new Error("Invalid bakeryId in session");
    }
    const canManageAnyCustomer = session.user.role === "ADMIN" || session.user.role === "OWNER";

    return readThroughCache(
        () => getCachedCustomersByAccess(bakeryId, userId, canManageAnyCustomer),
        () => queryCustomersByAccess(bakeryId, userId, canManageAnyCustomer)
    );
}

async function updateCustomer(customerId: number, updateInfo: updateCustomerInfo) {
    const { customer } = await getAuthorizedCustomer(customerId, await headers(), "update");
    const updatedCustomer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
            name: updateInfo.name,
            phoneNumber: updateInfo.phoneNumber,
        },
    });

    expireCache([CACHE_TAGS.customers, CACHE_TAGS.dashboard, CACHE_TAGS.admin], ["/customers", "/orders/new", "/dashboard", "/Admin"]);

    return updatedCustomer;
}

async function deleteCustomer(customerId: number) {
    const { customer } = await getAuthorizedCustomer(customerId, await headers(), "delete");
    const deletedCustomer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
            isActive: false,
        },
    });

    expireCache([CACHE_TAGS.customers, CACHE_TAGS.dashboard, CACHE_TAGS.admin], ["/customers", "/orders/new", "/dashboard", "/Admin"]);

    return deletedCustomer;
}

export {createCustomer,getCustomer,updateCustomer,deleteCustomer}
