import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


type newBakeryInfo = {
    id:number;
    name:string;
    ownerId:string;
};
async function createBakery(newBakeryInfo:newBakeryInfo){
    const session = await auth.api.getSession({
        headers:await headers()
    });
    if(!session || session.user.role !== "ADMIN"){
        console.log("login required (admin only)")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }

    const bakery = await prisma.bakery.create({
        data:{
            id:newBakeryInfo.id,
            name:newBakeryInfo.name,
            ownerId:newBakeryInfo.ownerId
        }
    })
    return bakery;
}

async function GetBakery(){
    const session = await auth.api.getSession({
        headers:await headers()
    });
    if(!session || session.user.role !== "ADMIN"){
        console.log("login required (admin only)")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }

    const bakery = await prisma.bakery.findMany();
    return bakery;
}

async function GetBakeryById(bakeryId:number){
    const session = await auth.api.getSession({
        headers:await headers()
    });
    if(!session){
        console.log("login required")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }

    const bakery = await prisma.bakery.findUnique({
        where:{
            id:bakeryId
        }
    });
    return bakery;
}

export {createBakery,GetBakery,GetBakeryById};