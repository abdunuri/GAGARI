'use client';

import { useEffect, useMemo, useRef, useState } from "react";

type OrderProductInput = {
  productId: number;
  unitPrice: number;
  quantity: string;
};

type OrderProductPayload = {
  productId: number;
  unitPrice: number;
  quantity: number;
};

type Customer = {
  id: number;
  name: string;
  phoneNumber: string;
};

type Order = {
  customer: Customer;
  orderProducts: OrderProductPayload[];
};

type NewOrderResponse = {
  message: string;
  order: Order;
};

type GetCustomerResponse = {
  message: string;
  customers: Customer[];
};

type Product = {
  id: number;
  name: string;
  price: number | string;
  category: "BREAD" | "FASTF" | "CAKE";
};

type GetProductResponse = {
  message: string;
  products: Product[];
};

type Mode = "single" | "bulk";

type BulkDraftOrder = {
  customerId: number;
  products: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
};

type BulkOrderDraft = {
  savedAt: number;
  expiresAt: number;
  orders: BulkDraftOrder[];
  selectedProductId: string;
};

import { useRouter } from "next/navigation";

const BULK_DRAFT_STORAGE_KEY = "bulk-order-draft";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function NewOrderPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<Mode>("bulk");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("1");
  const [orderProducts, setOrderProducts] = useState<OrderProductInput[]>([
    { productId: 0, unitPrice: 0, quantity: "" },
  ]);
  const [bulkQuantities, setBulkQuantities] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [draftInfo, setDraftInfo] = useState<{ savedAt: number; restored: boolean } | null>(null);
  const bulkQuantityRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasHydratedDraft = useRef(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customer", { method: "GET" });
        const data: GetCustomerResponse = await res.json();
        setCustomers(data.customers);

        setBulkQuantities((current) => {
          const next = { ...current };
          for (const customer of data.customers) {
            if (next[customer.id] === undefined) {
              next[customer.id] = "";
            }
          }
          return next;
        });
      } catch {
        setMessage("Failed to load customers");
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product", { method: "GET" });
        const data: GetProductResponse = await res.json();
        setProducts(data.products);

        const breadProducts = data.products.filter((product) => product.category === "BREAD");
        if (breadProducts.length > 0) {
          setSelectedProductId((current) => current || String(breadProducts[0].id));
        }
      } catch {
        setMessage("Failed to load products");
      }
    };

    void fetchCustomers();
    void fetchProducts();
  }, []);

  const breadProducts = useMemo(
    () => products.filter((product) => product.category === "BREAD"),
    [products]
  );

  const selectedBreadProduct = useMemo(
    () => breadProducts.find((product) => product.id === Number(selectedProductId)),
    [breadProducts, selectedProductId]
  );

  const selectedBreadPrice = Number(selectedBreadProduct?.price ?? 0);

  const toSafeNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const singleOrderTotal = orderProducts.reduce((sum, product) => {
    const quantity = toSafeNumber(product.quantity);
    return sum + Number(product.unitPrice) * quantity;
  }, 0);

  const bulkRows = customers.map((customer) => {
    const quantity = toSafeNumber(bulkQuantities[customer.id] ?? "");
    return {
      customer,
      quantity,
      total: quantity * selectedBreadPrice,
    };
  });

  const bulkTotal = bulkRows.reduce((sum, row) => sum + row.quantity, 0);
  const bulkOrderCount = bulkRows.filter((row) => row.quantity > 0).length;

  const clearBulkDraft = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(BULK_DRAFT_STORAGE_KEY);
  };

  useEffect(() => {
    if (typeof window === "undefined" || hasHydratedDraft.current) {
      return;
    }

    hasHydratedDraft.current = true;

    const raw = window.localStorage.getItem(BULK_DRAFT_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as BulkOrderDraft;
      const now = Date.now();

      if (
        !parsed ||
        typeof parsed.savedAt !== "number" ||
        typeof parsed.expiresAt !== "number" ||
        now > parsed.expiresAt
      ) {
        clearBulkDraft();
        return;
      }

      const restoredQuantities: Record<number, string> = {};
      for (const order of parsed.orders ?? []) {
        const restoredQuantity = Number(order.products?.[0]?.quantity ?? 0);
        restoredQuantities[order.customerId] = restoredQuantity > 0 ? String(restoredQuantity) : "";
      }

      if (parsed.selectedProductId) {
        setSelectedProductId(parsed.selectedProductId);
      }
      setBulkQuantities((current) => ({ ...current, ...restoredQuantities }));
      setActiveMode("bulk");
      setDraftInfo({ savedAt: parsed.savedAt, restored: true });
    } catch {
      clearBulkDraft();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedDraft.current) {
      return;
    }

    if (activeMode !== "bulk") {
      return;
    }

    const rowsToStore = customers
      .map((customer) => {
        const quantity = toSafeNumber(bulkQuantities[customer.id] ?? "");
        return {
          customer,
          quantity,
        };
      })
      .filter((row) => row.quantity > 0);
    const hasDraft = rowsToStore.length > 0 || Boolean(selectedProductId);

    if (!hasDraft) {
      clearBulkDraft();
      setDraftInfo(null);
      return;
    }

    const now = Date.now();
    const draft: BulkOrderDraft = {
      savedAt: now,
      expiresAt: now + ONE_DAY_MS,
      selectedProductId,
      orders: rowsToStore.map((row) => ({
        customerId: row.customer.id,
        products: [
          {
            productId: Number(selectedProductId) || 0,
            quantity: row.quantity,
            unitPrice: selectedBreadPrice,
          },
        ],
      })),
    };

    window.localStorage.setItem(BULK_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftInfo((previous) => ({
      savedAt: now,
      restored: previous?.restored ?? false,
    }));
  }, [activeMode, bulkQuantities, customers, selectedBreadPrice, selectedProductId]);

  const handleProductChange = <K extends keyof OrderProductInput>(
    index: number,
    field: K,
    value: OrderProductInput[K]
  ) => {
    const updated = [...orderProducts];
    updated[index][field] = value;
    setOrderProducts(updated);
  };

  const addProduct = () => {
    setOrderProducts((current) => [
      ...current,
      { productId: 0, unitPrice: 0, quantity: "" },
    ]);
  };

  const removeProduct = (index: number) => {
    setOrderProducts((current) => current.filter((_, productIndex) => productIndex !== index));
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const normalizedOrderProducts: OrderProductPayload[] = orderProducts.map((product) => ({
        productId: product.productId,
        unitPrice: product.unitPrice,
        quantity: toSafeNumber(product.quantity),
      }));

      if (normalizedOrderProducts.some((product) => product.quantity <= 0)) {
        throw new Error("Please enter quantity greater than 0 for all products");
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: Number(customerId),
          orderProducts: normalizedOrderProducts,
        }),
      });

      const data: NewOrderResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Order created successfully");
      setCustomerId("");
      setOrderProducts([{ productId: 0, unitPrice: 0, quantity: "" }]);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!selectedBreadProduct) {
        throw new Error("Select a bread product first");
      }

      const rowsToSubmit = bulkRows.filter((row) => row.quantity > 0);
      const bulkBatchId = crypto.randomUUID();

      if (rowsToSubmit.length === 0) {
        throw new Error("Enter at least one customer quantity");
      }

      await Promise.all(
        rowsToSubmit.map(async (row) => {
          const res = await fetch("/api/order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bulkBatchId,
              customerId: row.customer.id,
              orderProducts: [
                {
                  productId: selectedBreadProduct.id,
                  unitPrice: selectedBreadPrice,
                  quantity: row.quantity,
                },
              ],
            }),
          });

          const data: NewOrderResponse = await res.json();

          if (!res.ok) {
            throw new Error(data.message || `Failed for ${row.customer.name}`);
          }

          return data.order;
        })
      );

      setMessage(`Created ${rowsToSubmit.length} order${rowsToSubmit.length > 1 ? "s" : ""} successfully`);
      setBulkQuantities((current) => {
        const next = { ...current };
        for (const customer of customers) {
          next[customer.id] = "";
        }
        return next;
      });
      clearBulkDraft();
      setDraftInfo(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create bulk orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-4 text-zinc-900 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <section className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
        <div className="rounded-3xl border border-zinc-200 bg-white p-2.5 shadow-sm sm:p-3">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveMode("bulk")}
              className={
                activeMode === "bulk"
                  ? "rounded-2xl bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white sm:px-4 sm:py-3 sm:text-sm"
                  : "rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-white sm:px-4 sm:py-3 sm:text-sm"
              }
            >
              Bread by Customer
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("single")}
              className={
                activeMode === "single"
                  ? "rounded-2xl bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white sm:px-4 sm:py-3 sm:text-sm"
                  : "rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-white sm:px-4 sm:py-3 sm:text-sm"
              }
            >
              Single Order
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 shadow-sm">
            {message}
          </div>
        )}

        <section id="single-order" className={activeMode === "single" ? "block" : "hidden"}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
            <form
              onSubmit={handleSingleSubmit}
              className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Order</h1>
                <p className="mt-1 text-sm text-zinc-600 sm:text-base">Create a standard customer order.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900">Order Products</h2>

                {orderProducts.map((product, index) => (
                  <div
                    key={index}
                    className="relative grid grid-cols-2 gap-3 rounded-2xl border border-zinc-200 p-4 pr-12 md:grid-cols-[minmax(0,1fr)_120px_auto] md:items-end md:pr-4"
                  >
                    <select
                      className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                      required
                      value={product.productId}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selectedProduct = products.find((productItem) => productItem.id === selectedId);
                        handleProductChange(index, "productId", selectedId);
                        handleProductChange(index, "unitPrice", selectedProduct ? Number(selectedProduct.price) : 0);
                      }}
                    >
                      <option value="">Select Product</option>
                      {products.map((productOption) => (
                        <option key={productOption.id} value={productOption.id}>
                          {productOption.name} ({productOption.price})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductChange(index, "quantity", e.target.value)
                      }
                      className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                      required
                      min={1}
                    />

                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      aria-label={`Remove product row ${index + 1}`}
                      className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 md:static md:h-10 md:w-10 md:self-end"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M6 6l1 14h10l1-14" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProduct}
                  className="w-full rounded-full bg-zinc-900 px-4 py-3 font-medium text-white sm:w-auto"
                >
                  Add Product
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Order"}
              </button>
            </form>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Order Summary</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">${singleOrderTotal.toFixed(2)}</p>
                <p className="mt-1 text-sm text-zinc-600">Estimated total for the current product selection.</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Products Count</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{orderProducts.length}</p>
                <p className="mt-1 text-sm text-zinc-600">Update quantities before final submission.</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="bulk-bread-order" className={activeMode === "bulk" ? "block" : "hidden"}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
            <form
              onSubmit={handleBulkSubmit}
              className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
            >
              {draftInfo && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 sm:text-sm">
                  <p>
                    {draftInfo.restored ? "Draft restored." : "Draft saved."} Last update: {new Date(draftInfo.savedAt).toLocaleTimeString()}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkQuantities({});
                      setSelectedProductId("");
                      clearBulkDraft();
                      setDraftInfo(null);
                    }}
                    className="rounded-full border border-zinc-300 bg-white px-3 py-1 font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100"
                  >
                    Discard Draft
                  </button>
                </div>
              )}

              <div hidden>
                <label className="mb-1 block text-sm font-medium text-zinc-800">Bread Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                  required
                >
                  <option value="">Select Bread Product</option>
                  {breadProducts.map((bread) => (
                    <option key={bread.id} value={bread.id}>
                      {bread.name} ({bread.price})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-zinc-500">
                  Only products in the BREAD category are shown here.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-zinc-900">Customers</h3>
                  <p className="text-sm text-zinc-500">Enter quantity only</p>
                </div>

                <div className="space-y-3">
                  {bulkRows.map((row, index) => (
                    <div
                      key={row.customer.id}
                      className="grid grid-cols-2 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 md:gap-3 md:rounded-2xl md:p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900 md:text-base">{row.customer.name}</p>
                        <a href={`tel:${row.customer.phoneNumber}`} className="text-xs text-zinc-500 md:text-sm">
                          {row.customer.phoneNumber}
                        </a>
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Quantity</label>
                        <input
                          ref={(element) => {
                            bulkQuantityRefs.current[index] = element;
                          }}
                          type="number"
                          min={0}
                          value={bulkQuantities[row.customer.id] ?? ""}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const next = bulkQuantityRefs.current[index + 1];
                              if (next) {
                                next.focus();
                                next.select();
                              }
                            }
                          }}
                          onChange={(e) =>
                            setBulkQuantities((current) => ({
                              ...current,
                              [row.customer.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm md:rounded-2xl md:px-4 md:py-3"
                          placeholder="Enter quantity"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Bulk Orders"}
              </button>
            </form>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Bulk Total</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{bulkTotal}</p>
                <p className="mt-1 text-sm text-zinc-600">Total</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Active Customers</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{bulkOrderCount}</p>
                <p className="mt-1 text-sm text-zinc-600">Customers with quantity greater than zero.</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Selected Bread</p>
                <p className="mt-2 text-lg font-semibold text-zinc-900">
                  {selectedBreadProduct ? selectedBreadProduct.name : "No bread selected"}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {selectedBreadProduct ? `Unit price: $${selectedBreadPrice.toFixed(2)}` : "Choose a bread product to continue."}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}