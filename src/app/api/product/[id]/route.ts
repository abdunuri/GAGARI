import { DeleteProduct, UpdateProduct } from "@/services/product.service";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function parseProductId(id: string) {
    const parsed = Number(id);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isProductCategory(value: unknown): value is "BREAD" | "FASTF" | "CAKE" {
    return value === "BREAD" || value === "FASTF" || value === "CAKE";
}

export async function PUT(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const productId = parseProductId(id);

        if (!productId) {
            return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
        }

        const body = await req.json();
        if (typeof body.name !== "string" || body.name.trim() === "") {
            return NextResponse.json(
                { message: "Validation failed: name must be a non-empty string." },
                { status: 400 }
            );
        }

        if (!isProductCategory(body.category)) {
            return NextResponse.json(
                { message: "Validation failed: category must be one of BREAD, FASTF, CAKE." },
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

        const product = await UpdateProduct(productId, {
            name: body.name.trim(),
            category: body.category,
            price: parsedPrice,
        });

        return NextResponse.json({ message: "Product updated successfully", product }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update product.";
        const status = message.includes("not found") ? 404 : message.includes("not allowed") ? 403 : 500;
        return NextResponse.json({ message }, { status });
    }
}

export async function DELETE(_req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const productId = parseProductId(id);

        if (!productId) {
            return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
        }

        await DeleteProduct(productId);
        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete product.";
        const status = message.includes("not found")
            ? 404
            : message.includes("not allowed")
            ? 403
            : message.includes("cannot be deleted")
            ? 409
            : 500;
        return NextResponse.json({ message }, { status });
    }
}
