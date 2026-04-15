import { createCustomer,getCustomer } from "@/services/customer.service";
import { NextResponse } from "next/server";
export async function POST(req:Request){
    const body = await req.json();
    const customer = await createCustomer({
        name:body.name,
        phoneNumber:body.phoneNumber
    });

        return NextResponse.json(
            {message:"customer created successfully",customer},
            {status:201});
}

export async function GET(req:Request){
    const body = await req.json();
    const customers = await getCustomer();
    return NextResponse.json(
            {message:"feached all customers",customers},
            {status:200}
        )

}