import { deleteCustomer, updateCustomer } from "@/services/customer.service";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function parseCustomerId(id: string) {
    const parsed = Number(id);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PUT(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const customerId = parseCustomerId(id);

        if (!customerId) {
            return NextResponse.json({ message: "Invalid customer id." }, { status: 400 });
        }

        const body = await req.json();
        if (typeof body.name !== "string" || body.name.trim() === "") {
            return NextResponse.json(
                { message: "Validation failed: name must be a non-empty string." },
                { status: 400 }
            );
        }

        if (typeof body.phoneNumber !== "string" || body.phoneNumber.trim() === "") {
            return NextResponse.json(
                { message: "Validation failed: phoneNumber must be a non-empty string." },
                { status: 400 }
            );
        }

        const customer = await updateCustomer(customerId, {
            name: body.name.trim(),
            phoneNumber: body.phoneNumber.trim(),
        });

        return NextResponse.json({ message: "Customer updated successfully", customer }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update customer.";
        const status = message.includes("not found") ? 404 : message.includes("not allowed") ? 403 : 500;
        return NextResponse.json({ message }, { status });
    }
}

export async function DELETE(_req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const customerId = parseCustomerId(id);

        if (!customerId) {
            return NextResponse.json({ message: "Invalid customer id." }, { status: 400 });
        }

        await deleteCustomer(customerId);
        return NextResponse.json({ message: "Customer deleted successfully" }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete customer.";
        const status = message.includes("not found") ? 404 : message.includes("not allowed") ? 403 : 500;
        return NextResponse.json({ message }, { status });
    }
}
