import { getCustomerLastDayBulkQuantities, OrderServiceError } from "@/services/order.service";
import { NextResponse } from "next/server";

function getOrderErrorStatus(error: OrderServiceError) {
    switch (error.code) {
        case "INVALID_PAYLOAD":
            return 400;
        case "PRODUCT_NOT_IN_ORDER":
            return 400;
        case "UNAUTHORIZED":
            return 401;
        case "NOT_ALLOWED":
            return 403;
        case "NOT_FOUND":
            return 404;
        default:
            return 500;
    }
}

export async function GET() {
    try {
        const quantities = await getCustomerLastDayBulkQuantities();
        return NextResponse.json(
            {
                message: "Fetched last-day bulk quantities successfully.",
                quantities,
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof OrderServiceError) {
            return NextResponse.json({ message: error.message }, { status: getOrderErrorStatus(error) });
        }

        return NextResponse.json({ message: "Failed to fetch last-day bulk quantities." }, { status: 500 });
    }
}
