import { auth } from "@/lib/auth";
import { getCurrentSession } from "@/lib/auth-session";
import { CACHE_TAGS, expireCache, readThroughCache } from "@/lib/data-cache";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";


type newBakeryInfo = {
    id:number;
    name:string;
    ownerId:string;
};

const queryBakeries = async () => prisma.bakery.findMany();

const getCachedBakeries = unstable_cache(
    queryBakeries,
    ["bakeries"],
    {
        tags: [CACHE_TAGS.bakeries, CACHE_TAGS.admin],
        revalidate: 300,
    }
);

const queryBakeryById = async (bakeryId: number) => prisma.bakery.findUnique({
    where: {
        id: bakeryId,
    },
});

const getCachedBakeryById = unstable_cache(
    queryBakeryById,
    ["bakery-by-id"],
    {
        tags: [CACHE_TAGS.bakeries],
        revalidate: 300,
    }
);

async function createBakery(newBakeryInfo:newBakeryInfo){
    const session = await auth.api.getSession({
        headers:await headers()
    });
    if(!session || session.user.role !== "SYSTEM_ADMIN"){
        console.log("login required (system admin only)")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }

    const bakery = await prisma.bakery.create({
        data:{
            id:newBakeryInfo.id,
            name:newBakeryInfo.name,
            ownerId:newBakeryInfo.ownerId
        }
    })
    expireCache([CACHE_TAGS.bakeries, CACHE_TAGS.admin], ["/Admin"]);
    return bakery;
}

async function GetBakery(){
    const session = await auth.api.getSession({
        headers:await headers()
    });
    if(!session || session.user.role !== "SYSTEM_ADMIN"){
        console.log("login required (system admin only)")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }

    return readThroughCache(
        () => getCachedBakeries(),
        () => queryBakeries()
    );
}

async function GetBakeryById(bakeryId:number){
    const session = await getCurrentSession();
    if(!session){
        console.log("login required")
        redirect(`${process.env["BETTER_AUTH_URL"] ?? ""}/login`)    }

    return readThroughCache(
        () => getCachedBakeryById(bakeryId),
        () => queryBakeryById(bakeryId)
    );
}

export {createBakery,GetBakery,GetBakeryById};
