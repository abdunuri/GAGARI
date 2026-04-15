import { CreateItem, GetItems } from "@/services/item.service";
import { Message } from "@hugeicons/core-free-icons";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    const body = await req.json();
    const item = await CreateItem({
        name:body.name,
        category:body.category,
        price:body.price
    });

    return(
        NextResponse.json(
            {message:"item created successfully",item},
            {status:200}
        )
    )
}


export async function GET(){
    const items = await GetItems()
    return(
        NextResponse.json(
            {message:"items feached sucessfully",items},
            {status:200}
        )
    )
}