export type OrderProductInput = {
    productId: number;
    unitPrice: number;
    quantity: number;
};

export type CreateOrderRequestBody = {
    customerId: number;
    bulkBatchId?: string;
    bulkExpectedCount?: number;
    orderProducts: OrderProductInput[];
};

export function isJsonObjectBody(body: unknown): body is Record<string, unknown> {
    return Boolean(body) && typeof body === "object" && !Array.isArray(body);
}

export function isCreateOrderRequestBody(body: unknown): body is CreateOrderRequestBody {
    if (!isJsonObjectBody(body)) {
        return false;
    }

    const candidate = body as Partial<CreateOrderRequestBody> & {
        orderProducts?: unknown;
    };

    return (
        typeof candidate.customerId === "number" &&
        Array.isArray(candidate.orderProducts) &&
        candidate.orderProducts.every(
            (product) =>
                product !== null &&
                typeof product === "object" &&
                typeof (product as OrderProductInput).productId === "number" &&
                typeof (product as OrderProductInput).unitPrice === "number" &&
                (product as OrderProductInput).unitPrice >= 0 &&
                typeof (product as OrderProductInput).quantity === "number" &&
                (product as OrderProductInput).quantity > 0
        )
    );
}

export function hasOwn(payload: Record<string, unknown>, key: string) {
    return Object.prototype.hasOwnProperty.call(payload, key);
}
