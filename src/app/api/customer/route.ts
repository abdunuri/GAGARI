import { createCustomer,getCustomer } from "@/services/customer.service";
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

        if (typeof body.phoneNumber !== "string" || body.phoneNumber.trim() === "") {
            return NextResponse.json(
                { message: "Validation failed: phoneNumber must be a non-empty string." },
                { status: 400 }
            );
        }

        const customer = await createCustomer({
            name: body.name.trim(),
            phoneNumber: body.phoneNumber.trim()
        });

        return NextResponse.json(
            {message:"customer created successfully",customer},
            {status:201}
        );
    } catch (error) {
        console.error("Failed to create customer", error);
        return NextResponse.json(
            { message: "Failed to create customer." },
            { status: 500 }
        );
    }
}

export async function GET(req:Request){
    try {
        const customers = await getCustomer();
        return NextResponse.json(
            {message:"fetched all customers",customers},
            {status:200}
        )
    } catch (e) {
        console.error("Failed to fetch customers", e);
        return NextResponse.json(
            { message: "failed to fetch customers", error: String(e) },
            { status: 500 }
        )
    }

}