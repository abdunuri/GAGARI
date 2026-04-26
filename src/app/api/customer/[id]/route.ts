import { deleteCustomer, updateCustomer } from "@/services/customer.service";
import { auth } from "@/lib/auth";
import { HttpError } from "@/lib/errors";
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
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }

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
        if (error instanceof HttpError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }

        return NextResponse.json({ message: "Failed to update customer." }, { status: 500 });
    }
}

export async function DELETE(_req: Request, context: RouteContext) {
    try {
        const session = await auth.api.getSession({ headers: _req.headers });
        if (!session) {
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }

        const { id } = await context.params;
        const customerId = parseCustomerId(id);

        if (!customerId) {
            return NextResponse.json({ message: "Invalid customer id." }, { status: 400 });
        }

        await deleteCustomer(customerId);
        return NextResponse.json({ message: "Customer deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }

        return NextResponse.json({ message: "Failed to delete customer." }, { status: 500 });
    }
}
