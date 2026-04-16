import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client"
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type newItem  = {
    name:string,
    category:  "BREAD" | "FASTF" | "CAKE",
    price:Decimal,
};
async function CreateItem(newItem:newItem){
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
        console.error("CreateItem rejected due to invalid bakeryId", {
            userId: session.user.id,
            bakeryId: rawBakeryId,
        });
        throw new TypeError("Invalid bakeryId in user session");
    }

    const item = await prisma.item.create({
        data:{
            name:newItem.name,
            category:newItem.category,
            price:newItem.price,
            bakeryId:bakeryId,
            createdById:createdById,

        },
    });

    return item;
}


async function GetItems() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect(`${process.env["BETTER_AUTH_URL"]}/login`);
    }

    const bakeryId = Number.parseInt(String(session.user.bakeryId), 10);
    if (Number.isNaN(bakeryId)) {
        console.error("GetItems rejected due to invalid bakeryId", {
            userId: session.user.id,
            bakeryId: session.user.bakeryId,
        });
        throw new Error("User does not have a valid bakeryId");
    }

    const items = await prisma.item.findMany({
        where: { bakeryId }
    });
    return items
}

export {CreateItem,GetItems}