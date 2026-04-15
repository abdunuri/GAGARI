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
        redirect(`${process.env["BETTER_AUTH_URL"]}+/login`)
    }
    const createdById = session.user.id
    const bakeryId  =Number(session.user.bakeryId);

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
    const items = await prisma.item.findMany()
    return items
}

export {CreateItem,GetItems}