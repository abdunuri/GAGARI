import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { headers } from "next/headers";
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

function toCents(value: number) {
    return Math.round(value * 100);
}

function fromCents(value: number) {
    return Number((value / 100).toFixed(2));
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

    let deltaCents = targetCents - currentCents;
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

function parseTelegramChatIds() {
    const rawValue = process.env["tg_chat_ids"] ?? process.env["TG_CHAT_IDS"];

    if (!rawValue) {
        return [] as string[];
    }

    try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
            return parsed.map((value) => String(value).trim()).filter(Boolean);
        }
    } catch {
        // Fall through to comma-separated parsing.
    }

    return rawValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
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

function runPythonScript(args: string[]) {
    return new Promise<void>((resolve, reject) => {
        const pythonExecutable = process.env["PYTHON_EXECUTABLE"] || "python";
        const processInstance = spawn(pythonExecutable, args, {
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true,
        });

        let stderr = "";
        processInstance.stderr.on("data", (chunk) => {
            stderr += String(chunk);
        });

        processInstance.on("error", (error) => {
            reject(error);
        });

        processInstance.on("close", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(stderr || `Python script failed with code ${code}`));
        });
    });
}

async function renderBulkBatchTableImage(tableData: BulkBatchTableData, bulkBatchId: string) {
    const scriptPath = path.join(process.cwd(), "scripts", "render_bulk_table_image.py");
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "gagari-telegram-"));
    const payloadPath = path.join(tempDir, "bulk-table-payload.json");
    const imagePath = path.join(tempDir, `bulk-${bulkBatchId}.png`);

    const payload = {
        title: "Bulk Order - Customer x Product Quantities",
        batchId: bulkBatchId,
        headers: tableData.headers,
        rows: tableData.rows,
    };

    await fs.writeFile(payloadPath, JSON.stringify(payload), "utf8");
    await runPythonScript([scriptPath, payloadPath, imagePath]);

    return {
        tempDir,
        imagePath,
    };
}

async function sendTelegramBulkPhoto(
    telegramBotToken: string,
    chatIds: string[],
    imagePath: string,
    caption: string
) {
    const imageBuffer = await fs.readFile(imagePath);

    await Promise.allSettled(
        chatIds.map((chatId) => {
            const formData = new FormData();
            formData.append("chat_id", chatId);
            formData.append("caption", caption);
            formData.append("parse_mode", "HTML");
            formData.append("photo", new Blob([imageBuffer], { type: "image/png" }), path.basename(imagePath));

            return fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
                method: "POST",
                body: formData,
            });
        })
    );
}

async function sendTelegramBulkNotification(order: OrderNotificationPayload) {
    const telegramBotToken = process.env["TELEGRAM_BOT_TOKEN"];
    const chatIds = parseTelegramChatIds();

    if (!telegramBotToken || chatIds.length === 0) {
        return;
    }

    const message = buildOrderTelegramMessage(order);

    const payload = {
        parse_mode: "HTML",
        text: message,
    };

    await Promise.allSettled(
        chatIds.map((chatId) =>
            fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
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

async function maybeSendBulkBatchNotification(createdOrder: OrderNotificationPayload, bulkExpectedCount: number) {
    if (!createdOrder.bulkBatchId || !Number.isInteger(bulkExpectedCount) || bulkExpectedCount <= 0) {
        return;
    }

    const batchOrders = await prisma.order.findMany({
        where: {
            bulkBatchId: createdOrder.bulkBatchId,
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

    if (batchOrders.length !== bulkExpectedCount) {
        return;
    }

    const latestOrder = batchOrders[0];
    if (!latestOrder || latestOrder.id !== createdOrder.id) {
        return;
    }

    const telegramBotToken = process.env["TELEGRAM_BOT_TOKEN"];
    const chatIds = parseTelegramChatIds();

    if (!telegramBotToken || chatIds.length === 0 || !createdOrder.bulkBatchId) {
        return;
    }

    const tableData = buildBulkBatchTableData(batchOrders);
    const textFallbackMessage = buildBulkBatchTelegramMessage(tableData, createdOrder.bulkBatchId, batchOrders.length);
    const photoCaption = [
        "<b>Bulk order submitted</b>",
        `Batch ID: <code>${escapeTelegramHtml(createdOrder.bulkBatchId)}</code>`,
        `Customers: <b>${batchOrders.length}</b>`,
        `Total quantity: <b>${tableData.totalQuantity}</b>`,
    ].join("\n");

    let renderedImagePath: string | null = null;
    let tempDirToCleanup: string | null = null;

    try {
        const rendered = await renderBulkBatchTableImage(tableData, createdOrder.bulkBatchId);
        renderedImagePath = rendered.imagePath;
        tempDirToCleanup = rendered.tempDir;
        await sendTelegramBulkPhoto(telegramBotToken, chatIds, renderedImagePath, photoCaption);
        return;
    } catch (error) {
        console.error("Failed to render/send bulk table image, falling back to text", error);
    } finally {
        if (tempDirToCleanup) {
            await fs.rm(tempDirToCleanup, { recursive: true, force: true });
        }
    }

    const message = textFallbackMessage;

    await Promise.allSettled(
        chatIds.map((chatId) =>
            fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    parse_mode: "HTML",
                    text: message,
                }),
            })
        )
    );
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
    if (order.bulkBatchId) {
        try {
            if (typeof orderinput.bulkExpectedCount === "number") {
                await maybeSendBulkBatchNotification(order, orderinput.bulkExpectedCount);
            } else {
                await sendTelegramBulkNotification(order);
            }
        } catch (error) {
            console.error("Failed to send bulk order notification", error);
        }
    } else {
        const telegramBotToken = process.env["TELEGRAM_BOT_TOKEN"];
        const telegramChatId = process.env["TELEGRAM_CHAT_ID"];
        if (telegramBotToken && telegramChatId) {
            const message = buildOrderTelegramMessage(order);

            try {
                await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        chat_id: telegramChatId,
                        parse_mode: "HTML",
                        text: message
                    })
                });
            } catch (error) {
                console.error("Failed to send order notification", error);
            }
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

async function updateOrder(orderId: string, updateInput: updateOrderInput) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

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

        return prisma.orderProduct.update({
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
    }

    if (!shouldUpdateStatus && !shouldUpdateAmount) {
        throw new OrderServiceError("INVALID_PAYLOAD", "Nothing to update for this order.");
    }

    if (!shouldUpdateAmount) {
        return prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: updateInput.status,
            },
        });
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

    return prisma.$transaction(async (tx) => {
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
}

async function deleteOrder(orderId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

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

    return prisma.$transaction(async (tx) => {
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
}

export {createOrder ,getOrders,updateOrder,deleteOrder, OrderServiceError};