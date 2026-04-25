import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


type createOrderInput = {
    customerId: number;
    bulkBatchId?: string;
    orderProducts: {
        productId: number;
        unitPrice: number;
        quantity: number;
    }[];
};

type OrderListItem = {
    id: string;
    bulkBatchId: string | null;
    status: OrderStatus;
    customer: {
        id: number;
        name: string;
    };
    orderProducts: {
        unitPrice: Prisma.Decimal;
        quantity: number;
        product: {
            id: number;
            name: string;
        };
    }[];
};

const orderSelect = {
    id: true,
    bulkBatchId: true,
    status: true,
    customer: {
        select: {
            id: true,
            name: true,
        },
    },
    orderProducts: {
        select: {
            unitPrice: true,
            quantity: true,
            product: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

function getLoginRedirectUrl() {
    const baseUrl = process.env["BETTER_AUTH_URL"];
    return baseUrl ? `${baseUrl.replace(/\/$/, "")}/login` : "/login";
}

function parseBakeryId(bakeryId: string | number | null | undefined) {
    const parsed = Number(bakeryId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function createOrder(orderinput: createOrderInput) {
    const session = await auth.api.getSession({
        headers:await headers()
    })

    if(!session){
        redirect(getLoginRedirectUrl());
    }

    const createdById = session.user.id;
    const bakeryId = parseBakeryId(session.user.bakeryId);

    if (!bakeryId) {
        throw new Error("Your account is not linked to a bakery.");
    }

    const customer = await prisma.customer.findFirst({
        where: {
            id: orderinput.customerId,
            bakeryId,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!customer) {
        throw new Error("Customer not found in this bakery.");
    }

    const productIds = [...new Set(orderinput.orderProducts.map((product) => product.productId))];
    const products = await prisma.product.findMany({
        where: {
            id: {
                in: productIds,
            },
            bakeryId,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (products.length !== productIds.length) {
        throw new Error("One or more products do not belong to this bakery.");
    }

    const order = await prisma.order.create({
        data: {
            createdById,
            bakeryId,
            customerId: customer.id,
            bulkBatchId: orderinput.bulkBatchId,
            orderProducts: {
                create: orderinput.orderProducts.map((product) => ({
                    productId: product.productId,
                    unitPrice: product.unitPrice,
                    quantity: product.quantity,
                })),
            },
        },
        include: {
            orderProducts:true,
            customer:true
        }
    });
    // Send order to telegram bot
    const telegramBotToken = process.env["TELEGRAM_BOT_TOKEN"];
    const telegramChatId = process.env["TELEGRAM_CHAT_ID"];
    if (telegramBotToken && telegramChatId) {
        const message = [
            "New order created",
            `Order ID: ${order.id}`,
            `Customer: ${order.customer.name}`,
            `Items: ${order.orderProducts.length}`,
            `Total: $${order.orderProducts.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0).toFixed(2)}`,
            "Products:",
            ...order.orderProducts.map(
                (op) => `- ${op.productId}: ${op.quantity} x $${Number(op.unitPrice).toFixed(2)}`
            ),
        ].join("\n");

        try {
            await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    text: message
                })
            });
        } catch (error) {
            console.error("Failed to send order notification", error);
        }
    }

    return order;
    
};

async function getOrders(page = 1, pageSize = 20): Promise<OrderListItem[]> {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect(getLoginRedirectUrl());
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    const userId = session.user.id;
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);
    if (!bakeryId) {
        return [];
    }

    if(session.user.role === "ADMIN"||session.user.role === "OWNER"){
        const orders = await prisma.order.findMany({
            where: {
                bakeryId,
            },
            select: orderSelect,
            orderBy: {
                createdAt: "desc"
            },
            skip: (safePage - 1) * safePageSize,
            take: safePageSize
        })
        return orders
    }
    const orders = await prisma.order.findMany({
        where: {
            bakeryId,
            createdById: userId
        },
        select: orderSelect,
        orderBy: {
            createdAt: "desc"
        },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize
    })
    return orders
};

export {createOrder ,getOrders};