import { auth } from "@/lib/auth";
import { CACHE_TAGS, expireCache, readThroughCache } from "@/lib/data-cache";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { getCurrentSession } from "@/lib/auth-session";
import { getLoginRedirectUrl, parseBakeryId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client"
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
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

function assertCanMutateProducts(role: string | null | undefined) {
    if (role === "VIEWER") {
        throw new ForbiddenError("Viewers are not allowed to modify products.");
    }
}

const queryProductsByBakery = async (bakeryId: number) => {
    const products = await prisma.product.findMany({
        where: { bakeryId },
        orderBy: {
            name: "asc",
        },
    });

    return products.map((product) => ({
        ...product,
        price: Number(product.price),
    }));
};

const getCachedProductsByBakery = unstable_cache(
    queryProductsByBakery,
    ["products-by-bakery"],
    {
        tags: [CACHE_TAGS.products],
        revalidate: 60,
    }
);

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
    assertCanMutateProducts(session.user.role);

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
    const session = await getCurrentSession();

    if(!session){
        redirect(getLoginRedirectUrl())
    }
    assertCanMutateProducts(session.user.role);

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

    expireCache([CACHE_TAGS.products, CACHE_TAGS.dashboard, CACHE_TAGS.admin], ["/products", "/orders/new", "/dashboard", "/Admin"]);

    return product;
}


async function GetProducts() {
    const session = await getCurrentSession();

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

    return readThroughCache(
        () => getCachedProductsByBakery(bakeryId),
        () => queryProductsByBakery(bakeryId)
    );
}

async function UpdateProduct(productId: number, updateInput: updateProductInput) {
    await getAuthorizedProduct(productId);

    const product = await prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            name: updateInput.name,
            category: updateInput.category,
            price: updateInput.price,
        },
    });

    expireCache([CACHE_TAGS.products, CACHE_TAGS.orders, CACHE_TAGS.dashboard, CACHE_TAGS.admin], ["/products", "/orders", "/orders/new", "/dashboard", "/Admin"]);

    return product;
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

    const product = await prisma.product.delete({
        where: {
            id: productId,
        },
    });

    expireCache([CACHE_TAGS.products, CACHE_TAGS.dashboard, CACHE_TAGS.admin], ["/products", "/orders/new", "/dashboard", "/Admin"]);

    return product;
}

export {CreateProduct,GetProducts,UpdateProduct,DeleteProduct}
