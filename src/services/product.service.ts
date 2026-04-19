import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client"
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type newProduct  = {
    name:string,
    category:  "BREAD" | "FASTF" | "CAKE",
    price:Decimal,
};
async function CreateProduct(newProduct:newProduct){
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        redirect(`${process.env["BETTER_AUTH_URL"]}/login`)
    }

    const createdById = session.user.id
    const rawBakeryId = session.user.bakeryId;
    const bakeryId = Number.parseInt(String(rawBakeryId), 10);

    if (Number.isNaN(bakeryId)) {
        console.error("CreateProduct rejected due to invalid bakeryId", {
            userId: session.user.id,
            bakeryId: rawBakeryId,
        });
        throw new TypeError("Invalid bakeryId in user session");
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
        redirect(`${process.env["BETTER_AUTH_URL"]}/login`);
    }

    const bakeryId = Number.parseInt(String(session.user.bakeryId), 10);
    if (Number.isNaN(bakeryId)) {
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

export {CreateProduct,GetProducts}