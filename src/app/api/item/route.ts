import { CreateItem, GetItems } from "@/services/item.service";
import { Message } from "@hugeicons/core-free-icons";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    try {
        const body = await req.json();

        if (typeof body.name !== "string" || body.name.trim() === "") {
            return NextResponse.json(
                { message: "Validation failed: name must be a non-empty string." },
                { status: 400 }
            );
        }

        if (typeof body.category !== "string" || body.category.trim() === "") {
            return NextResponse.json(
                { message: "Validation failed: category must be a non-empty string." },
                { status: 400 }
            );
        }

        const parsedPrice = typeof body.price === "number" ? body.price : Number(body.price);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            return NextResponse.json(
                { message: "Validation failed: price must be a positive number." },
                { status: 400 }
            );
        }

        const item = await CreateItem({
            name: body.name.trim(),
            category: body.category.trim(),
            price: parsedPrice
        });

        return NextResponse.json(
            {message:"item created successfully",item},
            {status:201}
        );
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { message: "Invalid JSON payload." },
                { status: 400 }
            );
        }

        console.error("Failed to create item", error);
        return NextResponse.json(
            { message: "Failed to create item." },
            { status: 500 }
        );
    }
}


export async function GET(){
    try {
        const items = await GetItems()
        return NextResponse.json(
            { message: "items fetched successfully", items },
            { status: 200 }
        )
    } catch (e) {
        console.error("Failed to fetch items", e)
        const errorMessage = e instanceof Error ? e.message : "unknown"
        return NextResponse.json(
            { message: "failed to fetch items", error: errorMessage },
            { status: 500 }
        )
    }
}