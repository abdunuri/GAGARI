import { CreateProduct, GetProducts } from "@/services/product.service";
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

        const product = await CreateProduct({
            name: body.name.trim(),
            category: body.category.trim(),
            price: parsedPrice
        });

        return NextResponse.json(
            {message:"product created successfully",product},
            {status:201}
        );
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { message: "Invalid JSON payload." },
                { status: 400 }
            );
        }

        console.error("Failed to create product", error);
        return NextResponse.json(
            { message: "Failed to create product." },
            { status: 500 }
        );
    }
}


export async function GET(){
    try {
        const products = await GetProducts()
        return NextResponse.json(
            { message: "products fetched successfully", products },
            { status: 200 }
        )
    } catch (e) {
        console.error("Failed to fetch products", e)
        const errorMessage = e instanceof Error ? e.message : "unknown"
        return NextResponse.json(
            { message: "failed to fetch products", error: errorMessage },
            { status: 500 }
        )
    }
}