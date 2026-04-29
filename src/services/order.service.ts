import { getCurrentSession } from "@/lib/auth-session";
import { CACHE_TAGS, expireCache, readThroughCache } from "@/lib/data-cache";
import { getLoginRedirectUrl, parseBakeryId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { getTelegramSettingsForBakery, type TelegramNotificationSettings } from "@/services/telegram-settings.service";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";


type createOrderInput = {
    customerId: number;
    bulkBatchId?: string;
    bulkExpectedCount?: number;
    orderProducts: {
        productId: number;
        unitPrice: number;
        quantity: number;
    }[];
};

type BatchOrderInput = {
    customerId: number;
    orderProducts: {
        productId: number;
        unitPrice: number;
        quantity: number;
    }[];
};

type CreateOrdersBatchInput = {
    bulkBatchId: string;
    bulkExpectedCount: number;
    orders: BatchOrderInput[];
};

type updateOrderInput = {
    status?: OrderStatus;
    totalAmount?: number;
    productId?: number;
    quantity?: number;
};

type OrderServiceErrorCode =
    | "INVALID_PAYLOAD"
    | "NOT_FOUND"
    | "NOT_ALLOWED"
    | "PRODUCT_NOT_IN_ORDER"
    | "UNAUTHORIZED";

class OrderServiceError extends Error {
    code: OrderServiceErrorCode;

    constructor(code: OrderServiceErrorCode, message: string) {
        super(message);
        this.name = "OrderServiceError";
        this.code = code;
    }
}

function assertCanMutateOrders(role: string | null | undefined) {
    if (role === "VIEWER") {
        throw new OrderServiceError("NOT_ALLOWED", "Viewers are not allowed to modify orders.");
    }
}

type OrderNotificationPayload = {
    id: string;
    bakeryId: number;
    bulkBatchId: string | null;
    customer: {
        name: string;
    };
    orderProducts: {
        productId: number;
        quantity: number;
        unitPrice: Prisma.Decimal;
    }[];
};

type BulkBatchOrderPayload = {
    id: string;
    createdAt: Date;
    customer: {
        name: string;
    };
    orderProducts: {
        quantity: number;
        product: {
            name: string;
        };
    }[];
};

type BulkBatchTableData = {
    headers: string[];
    rows: string[][];
    totalQuantity: number;
};

type OrderListItem = {
    id: string;
    bulkBatchId: string | null;
    status: OrderStatus;
    createdAt: string;
    customer: {
        id: number;
        name: string;
    };
    orderProducts: {
        unitPrice: number;
        quantity: number;
        product: {
            id: number;
            name: string;
        };
    }[];
};

type CustomerLastDayBulkQuantity = {
    customerId: number;
    quantity: number;
    orderedAt: string;
};

const orderSelect = {
    id: true,
    bulkBatchId: true,
    status: true,
    createdAt: true,
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

function toCents(value: number) {
    return Math.round(value * 100);
}

function fromCents(value: number) {
    return Number((value / 100).toFixed(2));
}

function expireOrderCaches() {
    expireCache([CACHE_TAGS.orders, CACHE_TAGS.dashboard, CACHE_TAGS.admin], ["/orders", "/orders/new", "/dashboard", "/Admin"]);
}

function normalizeOrderList(orders: Array<Prisma.OrderGetPayload<{ select: typeof orderSelect }>>): OrderListItem[] {
    return orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        orderProducts: order.orderProducts.map((product) => ({
            ...product,
            unitPrice: Number(product.unitPrice),
        })),
    }));
}

function findUnboundedCoinCombination(denominations: number[], target: number) {
    const previous = new Array<number | null>(target + 1).fill(null);
    const usedIndex = new Array<number>(target + 1).fill(-1);
    previous[0] = 0;

    for (let current = 0; current <= target; current++) {
        if (current !== 0 && previous[current] === null) {
            continue;
        }

        for (let index = 0; index < denominations.length; index++) {
            const next = current + denominations[index];
            if (next <= target && previous[next] === null) {
                previous[next] = current;
                usedIndex[next] = index;
            }
        }
    }

    if (previous[target] === null) {
        return null;
    }

    const counts = new Array(denominations.length).fill(0);
    let current = target;

    while (current > 0) {
        const index = usedIndex[current];
        if (index < 0) {
            return null;
        }

        counts[index] += 1;
        current = previous[current] ?? 0;
    }

    return counts;
}

function findBoundedCoinCombination(denominations: number[], limits: number[], target: number) {
    const memo = new Map<string, number[] | null>();

    const search = (index: number, remaining: number): number[] | null => {
        if (remaining === 0) {
            return new Array(denominations.length - index).fill(0);
        }

        if (index === denominations.length) {
            return null;
        }

        const key = `${index}:${remaining}`;
        if (memo.has(key)) {
            return memo.get(key) ?? null;
        }

        const denomination = denominations[index];
        const maxUse = Math.min(limits[index], Math.floor(remaining / denomination));

        for (let use = maxUse; use >= 0; use--) {
            const tail = search(index + 1, remaining - use * denomination);
            if (tail) {
                const result = [use, ...tail];
                memo.set(key, result);
                return result;
            }
        }

        memo.set(key, null);
        return null;
    };

    return search(0, target);
}

function rebalanceOrderProductPrices(
    products: Array<{ id: number; quantity: number; unitPrice: number }>,
    targetTotal: number
) {
    const targetCents = toCents(targetTotal);
    const priceCents = products.map((product) => toCents(product.unitPrice));
    const quantities = products.map((product) => product.quantity);

    let currentCents = 0;
    for (let index = 0; index < products.length; index++) {
        currentCents += priceCents[index] * quantities[index];
    }

    const deltaCents = targetCents - currentCents;
    if (deltaCents === 0) {
        return products;
    }

    const adjustments = new Array(products.length).fill(0);

    if (deltaCents > 0) {
        const positiveCounts = findUnboundedCoinCombination(quantities, deltaCents);
        if (!positiveCounts) {
            throw new OrderServiceError(
                "INVALID_PAYLOAD",
                "Unable to reconcile rounded line items with the requested total amount."
            );
        }

        for (let index = 0; index < positiveCounts.length; index++) {
            adjustments[index] += positiveCounts[index];
        }
    } else {
        const negativeTarget = Math.abs(deltaCents);
        const limits = priceCents.map((priceCent) => Math.max(0, priceCent - 1));
        const negativeCounts = findBoundedCoinCombination(quantities, limits, negativeTarget);
        if (!negativeCounts) {
            throw new OrderServiceError(
                "INVALID_PAYLOAD",
                "Unable to safely reduce rounded line items to the requested total amount."
            );
        }

        for (let index = 0; index < negativeCounts.length; index++) {
            adjustments[index] -= negativeCounts[index];
        }
    }

    const adjustedProducts = products.map((product, index) => {
        const nextPriceCents = priceCents[index] + adjustments[index];
        if (!Number.isInteger(nextPriceCents) || nextPriceCents <= 0) {
            throw new OrderServiceError(
                "INVALID_PAYLOAD",
                "Unable to persist a positive unit price after rounding adjustments."
            );
        }

        return {
            ...product,
            unitPrice: fromCents(nextPriceCents),
        };
    });

    const adjustedTotalCents = adjustedProducts.reduce(
        (sum, product) => sum + toCents(product.unitPrice) * product.quantity,
        0
    );

    if (adjustedTotalCents !== targetCents) {
        throw new OrderServiceError(
            "INVALID_PAYLOAD",
            "Unable to reconcile rounded line items with the requested total amount."
        );
    }

    return adjustedProducts;
}

function escapeTelegramHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildOrderTelegramMessage(order: OrderNotificationPayload) {
    const total = order.orderProducts.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

    const lines = [
        `<b>${escapeTelegramHtml(order.bulkBatchId ? "Bulk order submitted" : "New order created")}</b>`,
        `Order ID: <code>${escapeTelegramHtml(order.id)}</code>`,
        `Customer: <b>${escapeTelegramHtml(order.customer.name)}</b>`,
        `Items: <b>${order.orderProducts.length}</b>`,
        `Total: <b>$${total.toFixed(2)}</b>`,
        "",
        "<b>Items</b>",
        `<pre>${escapeTelegramHtml(
            [
                "Product ID | Qty | Unit Price | Line Total",
                ...order.orderProducts.map((item) => {
                    const lineTotal = Number(item.unitPrice) * item.quantity;
                    return `${String(item.productId).padEnd(10)} | ${String(item.quantity).padEnd(3)} | $${Number(item.unitPrice).toFixed(2).padEnd(10)} | $${lineTotal.toFixed(2)}`;
                }),
            ].join("\n")
        )}</pre>`,
    ];

    return lines.join("\n");
}

function buildBulkBatchTableData(orders: BulkBatchOrderPayload[]): BulkBatchTableData {
    const productNames = Array.from(
        new Set(orders.flatMap((order) => order.orderProducts.map((product) => product.product.name)))
    ).sort((a, b) => a.localeCompare(b));

    const quantityMatrix = orders.map((order) => {
        const quantitiesByProduct = new Map<string, number>();

        for (const orderProduct of order.orderProducts) {
            const current = quantitiesByProduct.get(orderProduct.product.name) ?? 0;
            quantitiesByProduct.set(orderProduct.product.name, current + orderProduct.quantity);
        }

        return {
            customerName: order.customer.name,
            quantitiesByProduct,
        };
    });

    const totalQuantity = quantityMatrix.reduce(
        (sum, row) =>
            sum + productNames.reduce((rowSum, productName) => rowSum + (row.quantitiesByProduct.get(productName) ?? 0), 0),
        0
    );

    const headers = ["Customer", ...productNames];
    const rows = quantityMatrix.map((row) => {
        const values = [
            row.customerName,
            ...productNames.map((productName) => String(row.quantitiesByProduct.get(productName) ?? 0)),
        ];
        return values;
    });

    return {
        headers,
        rows,
        totalQuantity,
    };
}

function buildBulkBatchTelegramMessage(tableData: BulkBatchTableData, bulkBatchId: string, customerCount: number) {
    const { headers, rows, totalQuantity } = tableData;

    const columnWidths = headers.map((header, index) => {
        const maxRowWidth = rows.reduce((max, row) => Math.max(max, row[index]?.length ?? 0), 0);
        return Math.max(header.length, maxRowWidth);
    });

    const formatRow = (columns: string[]) =>
        columns
            .map((column, index) => column.padEnd(columnWidths[index]))
            .join(" | ");

    const tableText = [
        formatRow(headers),
        columnWidths.map((width) => "-".repeat(width)).join("-+-"),
        ...rows.map((row) => formatRow(row)),
    ].join("\n");

    const lines = [
        "<b>Bulk order submitted</b>",
        `Batch ID: <code>${escapeTelegramHtml(bulkBatchId)}</code>`,
        `Customers: <b>${customerCount}</b>`,
        `Total quantity: <b>${totalQuantity}</b>`,
        "",
        "<b>Customer x Product Quantities</b>",
        `<pre>${escapeTelegramHtml(tableText)}</pre>`,
    ];

    return lines.join("\n");
}

async function sendTelegramMessage(settings: TelegramNotificationSettings, message: string) {
    const payload = {
        parse_mode: "HTML",
        text: message,
    };

    await Promise.allSettled(
        settings.chatIds.map((chatId) =>
            fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...payload,
                    chat_id: chatId,
                }),
            })
        )
    );
}

async function sendTelegramBulkNotification(order: OrderNotificationPayload) {
    const telegramSettings = await getTelegramSettingsForBakery(order.bakeryId);

    if (!telegramSettings) {
        return;
    }

    const message = buildOrderTelegramMessage(order);
    await sendTelegramMessage(telegramSettings, message);
}

async function maybeSendBulkBatchNotification(
    createdOrder: OrderNotificationPayload,
    bulkExpectedCount: number,
    completedCountDelta = 1
) {
    const bulkBatchId = createdOrder.bulkBatchId;

    if (
        !bulkBatchId ||
        !Number.isInteger(bulkExpectedCount) ||
        bulkExpectedCount <= 0 ||
        !Number.isInteger(completedCountDelta) ||
        completedCountDelta <= 0
    ) {
        return;
    }

    const telegramSettings = await getTelegramSettingsForBakery(createdOrder.bakeryId);

    if (!telegramSettings || !createdOrder.bulkBatchId) {
        return;
    }

    await prisma.$transaction(async (tx) => {
        const batchUpdate = await tx.bulkBatch.updateMany({
            where: {
                id: bulkBatchId,
                notified: false,
            },
            data: {
                completedCount: {
                    increment: completedCountDelta,
                },
            },
        });

        if (batchUpdate.count === 0) {
            return;
        }

        const batch = await tx.bulkBatch.findUnique({
            where: {
                id: bulkBatchId,
            },
            select: {
                completedCount: true,
                expectedCount: true,
                notified: true,
            },
        });

        if (!batch || batch.notified || batch.completedCount !== batch.expectedCount) {
            return;
        }

        const notificationState = await tx.bulkBatch.updateMany({
            where: {
                id: bulkBatchId,
                notified: false,
                completedCount: batch.completedCount,
            },
            data: {
                notified: true,
            },
        });

        if (notificationState.count === 0) {
            return;
        }

        const batchOrders = await tx.order.findMany({
            where: {
                bulkBatchId,
                bakeryId: createdOrder.bakeryId,
            },
            select: {
                id: true,
                createdAt: true,
                customer: {
                    select: {
                        name: true,
                    },
                },
                orderProducts: {
                    select: {
                        quantity: true,
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],
        });

        if (batchOrders.length === 0) {
            return;
        }

        const tableData = buildBulkBatchTableData(batchOrders);
        const textFallbackMessage = buildBulkBatchTelegramMessage(tableData, bulkBatchId, batchOrders.length);

        await sendTelegramMessage(telegramSettings, textFallbackMessage);
    });
}

async function createOrder(orderinput: createOrderInput) {
    const session = await getCurrentSession()

    if(!session){
        throw new OrderServiceError("UNAUTHORIZED", "You must be signed in.");
    }
    assertCanMutateOrders(session.user.role);

    const createdById = session.user.id;
    const bakeryId = parseBakeryId(session.user.bakeryId);

    if (!bakeryId) {
        throw new Error("Your account is not linked to a bakery.");
    }

    if (orderinput.bulkBatchId && typeof orderinput.bulkExpectedCount === "number") {
        await prisma.bulkBatch.upsert({
            where: {
                id: orderinput.bulkBatchId,
            },
            create: {
                id: orderinput.bulkBatchId,
                expectedCount: orderinput.bulkExpectedCount,
            },
            update: {
                expectedCount: orderinput.bulkExpectedCount,
            },
        });
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
    expireOrderCaches();

    if (order.bulkBatchId) {
        try {
            if (typeof orderinput.bulkExpectedCount === "number") {
                await maybeSendBulkBatchNotification(order, orderinput.bulkExpectedCount, 1);
            } else {
                await sendTelegramBulkNotification(order);
            }
        } catch (error) {
            console.error("Failed to send bulk order notification", error);
        }
    } else {
        const telegramSettings = await getTelegramSettingsForBakery(order.bakeryId);
        if (telegramSettings) {
            const message = buildOrderTelegramMessage(order);

            try {
                await sendTelegramMessage(telegramSettings, message);
            } catch (error) {
                console.error("Failed to send order notification", error);
            }
        }
    }

    return order;
    
};

async function createOrdersBatch(batchInput: CreateOrdersBatchInput) {
    const session = await getCurrentSession();

    if (!session) {
        throw new OrderServiceError("UNAUTHORIZED", "You must be signed in.");
    }
    assertCanMutateOrders(session.user.role);

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new OrderServiceError("NOT_ALLOWED", "Your account is not linked to a bakery.");
    }

    if (!batchInput.bulkBatchId || !Number.isInteger(batchInput.bulkExpectedCount) || batchInput.bulkExpectedCount <= 0) {
        throw new OrderServiceError("INVALID_PAYLOAD", "Invalid bulk batch metadata.");
    }

    if (!Array.isArray(batchInput.orders) || batchInput.orders.length === 0) {
        throw new OrderServiceError("INVALID_PAYLOAD", "At least one order is required.");
    }

    if (batchInput.orders.length !== batchInput.bulkExpectedCount) {
        throw new OrderServiceError("INVALID_PAYLOAD", "Bulk order count does not match the submitted orders.");
    }

    for (const order of batchInput.orders) {
        if (!Number.isInteger(order.customerId) || order.customerId <= 0) {
            throw new OrderServiceError("INVALID_PAYLOAD", "Each order must include a valid customer id.");
        }

        if (!Array.isArray(order.orderProducts) || order.orderProducts.length === 0) {
            throw new OrderServiceError("INVALID_PAYLOAD", "Each order must include at least one product.");
        }

        for (const product of order.orderProducts) {
            if (
                !Number.isInteger(product.productId) ||
                product.productId <= 0 ||
                !Number.isFinite(product.unitPrice) ||
                product.unitPrice < 0 ||
                !Number.isInteger(product.quantity) ||
                product.quantity <= 0
            ) {
                throw new OrderServiceError("INVALID_PAYLOAD", "Each product must include valid product, price, and quantity values.");
            }
        }
    }

    await prisma.bulkBatch.upsert({
        where: {
            id: batchInput.bulkBatchId,
        },
        create: {
            id: batchInput.bulkBatchId,
            expectedCount: batchInput.bulkExpectedCount,
        },
        update: {
            expectedCount: batchInput.bulkExpectedCount,
        },
    });

    const customerIds = [...new Set(batchInput.orders.map((order) => order.customerId))];
    const productIds = [...new Set(batchInput.orders.flatMap((order) => order.orderProducts.map((product) => product.productId)))];

    const [customers, products] = await Promise.all([
        prisma.customer.findMany({
            where: {
                id: {
                    in: customerIds,
                },
                bakeryId,
                isActive: true,
            },
            select: {
                id: true,
            },
        }),
        prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
                bakeryId,
            },
            select: {
                id: true,
            },
        }),
    ]);

    if (customers.length !== customerIds.length) {
        throw new OrderServiceError("NOT_FOUND", "One or more customers were not found in this bakery.");
    }

    if (products.length !== productIds.length) {
        throw new OrderServiceError("NOT_ALLOWED", "One or more products do not belong to this bakery.");
    }

    const createdOrders = await prisma.$transaction(async (tx) => {
        const results: OrderNotificationPayload[] = [];

        for (const orderInput of batchInput.orders) {
            const createdOrder = await tx.order.create({
                data: {
                    createdById: session.user.id,
                    bakeryId,
                    customerId: orderInput.customerId,
                    bulkBatchId: batchInput.bulkBatchId,
                    orderProducts: {
                        create: orderInput.orderProducts.map((product) => ({
                            productId: product.productId,
                            unitPrice: product.unitPrice,
                            quantity: product.quantity,
                        })),
                    },
                },
                include: {
                    orderProducts: true,
                    customer: true,
                },
            });

            results.push(createdOrder);
        }

        return results;
    });

    expireOrderCaches();

    const notificationSeedOrder = createdOrders[createdOrders.length - 1];
    if (notificationSeedOrder) {
        try {
            await maybeSendBulkBatchNotification(
                notificationSeedOrder,
                batchInput.bulkExpectedCount,
                createdOrders.length
            );
        } catch (error) {
            console.error("Failed to send bulk order notification", error);
        }
    }

    return createdOrders;
}

const queryOrdersByAccess = async (
    bakeryId: number,
    userId: string,
    canManageAnyOrder: boolean,
    page: number,
    pageSize: number
): Promise<OrderListItem[]> => {
    const orders = await prisma.order.findMany({
        where: {
            bakeryId,
            ...(canManageAnyOrder ? {} : { createdById: userId }),
        },
        select: orderSelect,
        orderBy: {
            createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    return normalizeOrderList(orders);
};

const getCachedOrdersByAccess = unstable_cache(
    queryOrdersByAccess,
    ["orders-by-access"],
    {
        tags: [CACHE_TAGS.orders],
        revalidate: 30,
    }
);

async function getOrders(page = 1, pageSize = 20): Promise<OrderListItem[]> {
    const session = await getCurrentSession()

    if (!session) {
        redirect(getLoginRedirectUrl());
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    const userId = session.user.id;
    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);
    const safePage = Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : 1;
    const safePageSize = Number.isFinite(pageSizeNum) && pageSizeNum >= 1 ? Math.floor(pageSizeNum) : 20;
    if (!bakeryId) {
        return [];
    }

    const canManageAnyOrder = session.user.role === "ADMIN" || session.user.role === "OWNER";

    return readThroughCache(
        () => getCachedOrdersByAccess(bakeryId, userId, canManageAnyOrder, safePage, safePageSize),
        () => queryOrdersByAccess(bakeryId, userId, canManageAnyOrder, safePage, safePageSize)
    );
};

const queryCustomerLastDayBulkQuantities = async (
    bakeryId: number,
    userId: string,
    canManageAnyOrder: boolean
): Promise<CustomerLastDayBulkQuantity[]> => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
        where: {
            bakeryId,
            bulkBatchId: {
                not: null,
            },
            ...(canManageAnyOrder
                ? {}
                : {
                    createdById: userId,
                }),
        },
        select: {
            customerId: true,
            createdAt: true,
            orderProducts: {
                select: {
                    quantity: true,
                },
            },
        },
        orderBy: [
            {
                createdAt: "desc",
            },
            {
                id: "desc",
            },
        ],
        take: 5000,
    });

    const sameDayFallback = new Map<number, { customerId: number; quantity: number; orderedAt: Date }>();
    const previousDayCandidates = new Map<number, { customerId: number; quantity: number; orderedAt: Date }>();

    for (const order of orders) {
        const quantity = order.orderProducts.reduce((sum, item) => sum + item.quantity, 0);
        const snapshot = {
            customerId: order.customerId,
            quantity,
            orderedAt: order.createdAt,
        };

        if (!sameDayFallback.has(order.customerId)) {
            sameDayFallback.set(order.customerId, snapshot);
        }

        if (order.createdAt < startOfToday && !previousDayCandidates.has(order.customerId)) {
            previousDayCandidates.set(order.customerId, snapshot);
        }
    }

    return [...sameDayFallback.keys()].map((customerId) => {
        const snapshot = previousDayCandidates.get(customerId) ?? sameDayFallback.get(customerId)!;

        return {
            ...snapshot,
            orderedAt: snapshot.orderedAt.toISOString(),
        };
    });
};

const getCachedCustomerLastDayBulkQuantities = unstable_cache(
    queryCustomerLastDayBulkQuantities,
    ["customer-last-day-bulk-quantities"],
    {
        tags: [CACHE_TAGS.orders],
        revalidate: 30,
    }
);

async function getCustomerLastDayBulkQuantities(): Promise<CustomerLastDayBulkQuantity[]> {
    const session = await getCurrentSession();

    if (!session) {
        throw new OrderServiceError("UNAUTHORIZED", "You must be signed in.");
    }
    assertCanMutateOrders(session.user.role);

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new OrderServiceError("NOT_ALLOWED", "Your account is not linked to a bakery.");
    }

    const canManageAnyOrder = session.user.role === "ADMIN" || session.user.role === "OWNER";

    return readThroughCache(
        () => getCachedCustomerLastDayBulkQuantities(bakeryId, session.user.id, canManageAnyOrder),
        () => queryCustomerLastDayBulkQuantities(bakeryId, session.user.id, canManageAnyOrder)
    );
}

async function updateOrder(orderId: string, updateInput: updateOrderInput) {
    const session = await getCurrentSession();

    if (!session) {
        throw new OrderServiceError("UNAUTHORIZED", "You must be signed in.");
    }
    assertCanMutateOrders(session.user.role);

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new OrderServiceError("NOT_ALLOWED", "Your account is not linked to a bakery.");
    }

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            bakeryId,
        },
        select: {
            id: true,
            createdById: true,
        },
    });

    if (!order) {
        throw new OrderServiceError("NOT_FOUND", "Order not found in this bakery.");
    }

    const canManageAnyOrder = session.user.role === "ADMIN" || session.user.role === "OWNER";
    if (!canManageAnyOrder && order.createdById !== session.user.id) {
        throw new OrderServiceError("NOT_ALLOWED", "You are not allowed to update this order.");
    }

    const shouldUpdateStatus = typeof updateInput.status !== "undefined";
    const shouldUpdateAmount = typeof updateInput.totalAmount !== "undefined";
    const shouldUpdateQuantity = typeof updateInput.productId !== "undefined" || typeof updateInput.quantity !== "undefined";

    if (shouldUpdateQuantity) {
        if (shouldUpdateStatus || shouldUpdateAmount) {
            throw new OrderServiceError(
                "INVALID_PAYLOAD",
                "Quantity updates cannot be combined with status or totalAmount updates."
            );
        }

        if (typeof updateInput.productId !== "number" || !Number.isInteger(updateInput.productId) || updateInput.productId <= 0) {
            throw new OrderServiceError("INVALID_PAYLOAD", "Product id must be a valid positive integer.");
        }

        if (typeof updateInput.quantity !== "number" || !Number.isInteger(updateInput.quantity) || updateInput.quantity <= 0) {
            throw new OrderServiceError("INVALID_PAYLOAD", "Quantity must be a positive integer.");
        }

        const orderProduct = await prisma.orderProduct.findFirst({
            where: {
                orderId,
                productId: updateInput.productId,
            },
            select: {
                id: true,
            },
        });

        if (!orderProduct) {
            throw new OrderServiceError("PRODUCT_NOT_IN_ORDER", "Product not found in this order.");
        }

        const updatedOrderProduct = await prisma.orderProduct.update({
            where: {
                productId_orderId: {
                    productId: updateInput.productId,
                    orderId,
                },
            },
            data: {
                quantity: updateInput.quantity,
            },
        });
        expireOrderCaches();

        return updatedOrderProduct;
    }

    if (!shouldUpdateStatus && !shouldUpdateAmount) {
        throw new OrderServiceError("INVALID_PAYLOAD", "Nothing to update for this order.");
    }

    if (!shouldUpdateAmount) {
        const order = await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: updateInput.status,
            },
        });
        expireOrderCaches();

        return order;
    }

    const targetTotal = Number(updateInput.totalAmount);
    if (!Number.isFinite(targetTotal) || targetTotal <= 0) {
        throw new OrderServiceError("INVALID_PAYLOAD", "Total amount must be a positive number.");
    }

    const orderWithProducts = await prisma.order.findFirst({
        where: {
            id: orderId,
            bakeryId,
        },
        select: {
            id: true,
            orderProducts: {
                select: {
                    id: true,
                    quantity: true,
                    unitPrice: true,
                },
                orderBy: {
                    id: "asc",
                },
            },
        },
    });

    if (!orderWithProducts || orderWithProducts.orderProducts.length === 0) {
        throw new OrderServiceError("NOT_FOUND", "Order does not have items to update amount.");
    }

    const currentTotal = orderWithProducts.orderProducts.reduce(
        (sum, product) => sum + Number(product.unitPrice) * product.quantity,
        0
    );

    if (currentTotal <= 0) {
        throw new OrderServiceError("INVALID_PAYLOAD", "Current order total is invalid.");
    }

    const scale = targetTotal / currentTotal;
    const toTwo = (value: number) => Math.round(value * 100) / 100;

    const updatedProducts = orderWithProducts.orderProducts.map((product) => ({
        id: product.id,
        quantity: product.quantity,
        unitPrice: toTwo(Number(product.unitPrice) * scale),
    }));

    const lastIndex = updatedProducts.length - 1;
    if (lastIndex >= 0) {
        const subtotalWithoutLast = updatedProducts
            .slice(0, lastIndex)
            .reduce((sum, product) => sum + product.unitPrice * product.quantity, 0);
        const lastQuantity = updatedProducts[lastIndex].quantity;
        if (lastQuantity <= 0) {
            throw new OrderServiceError(
                "INVALID_PAYLOAD",
                "Last order item quantity must be greater than zero before adjusting total amount."
            );
        }

        const adjustedLastPrice = toTwo((targetTotal - subtotalWithoutLast) / lastQuantity);
        if (Number.isFinite(adjustedLastPrice) && adjustedLastPrice > 0) {
            updatedProducts[lastIndex].unitPrice = adjustedLastPrice;
        }
    }

    const rebalancedProducts = rebalanceOrderProductPrices(updatedProducts, targetTotal);

    const updatedOrder = await prisma.$transaction(async (tx) => {
        for (const product of rebalancedProducts) {
            await tx.orderProduct.update({
                where: {
                    id: product.id,
                },
                data: {
                    unitPrice: product.unitPrice,
                },
            });
        }

        if (shouldUpdateStatus) {
            return tx.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: updateInput.status,
                },
            });
        }

        return tx.order.findUniqueOrThrow({
            where: {
                id: orderId,
            },
        });
    });

    expireOrderCaches();

    return updatedOrder;
}

async function deleteOrder(orderId: string) {
    const session = await getCurrentSession();

    if (!session) {
        throw new OrderServiceError("UNAUTHORIZED", "You must be signed in.");
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new OrderServiceError("NOT_ALLOWED", "Your account is not linked to a bakery.");
    }

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            bakeryId,
        },
        select: {
            id: true,
            createdById: true,
        },
    });

    if (!order) {
        throw new OrderServiceError("NOT_FOUND", "Order not found in this bakery.");
    }

    const canManageAnyOrder = session.user.role === "ADMIN" || session.user.role === "OWNER";
    if (!canManageAnyOrder && order.createdById !== session.user.id) {
        throw new OrderServiceError("NOT_ALLOWED", "You are not allowed to delete this order.");
    }

    const deletedOrder = await prisma.$transaction(async (tx) => {
        await tx.orderProduct.deleteMany({
            where: {
                orderId,
            },
        });

        return tx.order.delete({
            where: {
                id: orderId,
            },
        });
    });

    expireOrderCaches();

    return deletedOrder;
}

export {createOrder, createOrdersBatch, getOrders, getCustomerLastDayBulkQuantities, updateOrder, deleteOrder,OrderServiceError};
