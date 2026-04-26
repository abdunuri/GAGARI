import { auth } from "@/lib/auth";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { getLoginRedirectUrl, parseBakeryId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client"
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type newProduct  = {
    name:string,
    category:  "BREAD" | "FASTF" | "CAKE",
    price:Decimal,
};

type updateProductInput = {
    name: string;
    category: "BREAD" | "FASTF" | "CAKE";
    price: number;
};

async function getAuthorizedProduct(productId: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect(getLoginRedirectUrl());
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new Error("Invalid bakeryId in session");
    }

    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            bakeryId,
        },
        select: {
            id: true,
            createdById: true,
        },
    });

    if (!product) {
        throw new NotFoundError("Product not found in this bakery.");
    }

    const canManageAnyProduct = session.user.role === "ADMIN" || session.user.role === "OWNER";
    if (!canManageAnyProduct && product.createdById !== session.user.id) {
        throw new ForbiddenError("You are not allowed to manage this product.");
    }

    return product;
}

async function CreateProduct(newProduct:newProduct){
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        redirect(getLoginRedirectUrl())
    }

    const createdById = session.user.id
    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new Error("Invalid bakeryId in session");
    }

    const product = await prisma.product.create({
        data:{
            name:newProduct.name,
            category:newProduct.category,
            price:newProduct.price,
            bakeryId:bakeryId,
            createdById:createdById,

        },
    });

    return product;
}


async function GetProducts() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect(getLoginRedirectUrl());
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        console.error("GetProducts rejected due to invalid bakeryId", {
            userId: session.user.id,
            bakeryId: session.user.bakeryId,
        });
        throw new Error("User does not have a valid bakeryId");
    }

    const products = await prisma.product.findMany({
        where: { bakeryId }
    });
    return products
}

async function UpdateProduct(productId: number, updateInput: updateProductInput) {
    await getAuthorizedProduct(productId);

    return prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            name: updateInput.name,
            category: updateInput.category,
            price: updateInput.price,
        },
    });
}

async function DeleteProduct(productId: number) {
    await getAuthorizedProduct(productId);

    const orderProductsCount = await prisma.orderProduct.count({
        where: {
            productId,
        },
    });

    if (orderProductsCount > 0) {
        throw new ConflictError("This product is already used in orders and cannot be deleted.");
    }

    return prisma.product.delete({
        where: {
            id: productId,
        },
    });
}

export {CreateProduct,GetProducts,UpdateProduct,DeleteProduct}