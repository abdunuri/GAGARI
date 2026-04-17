'use client';

import { useEffect, useMemo, useRef, useState } from "react";

type OrderItemInput = {
  itemId: number;
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
  orderItems: OrderItemInput[];
};

type NewOrderResponse = {
  message: string;
  order: Order;
};

type GetCustomerResponse = {
  message: string;
  customers: Customer[];
};

type Item = {
  id: number;
  name: string;
  price: number | string;
  category: "BREAD" | "FASTF" | "CAKE";
};

type GetItemResponse = {
  message: string;
  items: Item[];
};

type Mode = "single" | "bulk";

import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<Mode>("bulk");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { itemId: 0, unitPrice: 0, quantity: 1 },
  ]);
  const [bulkQuantities, setBulkQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const bulkQuantityRefs = useRef<Array<HTMLInputElement | null>>([]);

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
              next[customer.id] = 0;
            }
          }
          return next;
        });
      } catch {
        setMessage("Failed to load customers");
      }
    };

    const fetchItems = async () => {
      try {
        const res = await fetch("/api/item", { method: "GET" });
        const data: GetItemResponse = await res.json();
        setItems(data.items);

        const breadItems = data.items.filter((item) => item.category === "BREAD");
        if (breadItems.length > 0) {
          setSelectedItemId((current) => current || String(breadItems[0].id));
        }
      } catch {
        setMessage("Failed to load items");
      }
    };

    void fetchCustomers();
    void fetchItems();
  }, []);

  const breadItems = useMemo(
    () => items.filter((item) => item.category === "BREAD"),
    [items]
  );

  const selectedBreadItem = useMemo(
    () => breadItems.find((item) => item.id === Number(selectedItemId)),
    [breadItems, selectedItemId]
  );

  const selectedBreadPrice = Number(selectedBreadItem?.price ?? 0);

  const singleOrderTotal = orderItems.reduce(
    (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity),
    0
  );

  const bulkRows = customers.map((customer) => {
    const quantity = bulkQuantities[customer.id] ?? 0;
    return {
      customer,
      quantity,
      total: quantity * selectedBreadPrice,
    };
  });

  const bulkTotal = bulkRows.reduce((sum, row) => sum + row.quantity, 0);
  const bulkOrderCount = bulkRows.filter((row) => row.quantity > 0).length;

  const handleItemChange = (
    index: number,
    field: keyof OrderItemInput,
    value: number
  ) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const addItem = () => {
    setOrderItems((current) => [
      ...current,
      { itemId: 0, unitPrice: 0, quantity: 1 },
    ]);
  };

  const removeItem = (index: number) => {
    setOrderItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: Number(customerId),
          orderItems,
        }),
      });

      const data: NewOrderResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Order created successfully");
      setCustomerId("");
      setOrderItems([{ itemId: 0, unitPrice: 0, quantity: 1 }]);
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
      if (!selectedBreadItem) {
        throw new Error("Select a bread item first");
      }

      const rowsToSubmit = bulkRows.filter((row) => row.quantity > 0);

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
              customerId: row.customer.id,
              orderItems: [
                {
                  itemId: selectedBreadItem.id,
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
          next[customer.id] = 0;
        }
        return next;
      });
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
                <h2 className="text-lg font-semibold text-zinc-900">Order Items</h2>

                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative grid grid-cols-2 gap-3 rounded-2xl border border-zinc-200 p-4 pr-12 md:grid-cols-[minmax(0,1fr)_120px_auto] md:items-end md:pr-4"
                  >
                    <select
                      className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                      required
                      value={item.itemId}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selectedItem = items.find((itm) => itm.id === selectedId);
                        handleItemChange(index, "itemId", selectedId);
                        handleItemChange(index, "unitPrice", selectedItem ? Number(selectedItem.price) : 0);
                      }}
                    >
                      <option value="">Select Item</option>
                      {items.map((sitem) => (
                        <option key={sitem.id} value={sitem.id}>
                          {sitem.name} ({sitem.price})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", Number(e.target.value))
                      }
                      className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                      required
                      min={1}
                    />

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      aria-label={`Remove item row ${index + 1}`}
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
                  onClick={addItem}
                  className="w-full rounded-full bg-zinc-900 px-4 py-3 font-medium text-white sm:w-auto"
                >
                  Add Item
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
                <p className="mt-1 text-sm text-zinc-600">Estimated total for the current item selection.</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Items Count</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{orderItems.length}</p>
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

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-800">Bread Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                  required
                >
                  <option value="">Select Bread Item</option>
                  {breadItems.map((bread) => (
                    <option key={bread.id} value={bread.id}>
                      {bread.name} ({bread.price})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-zinc-500">
                  Only items in the BREAD category are shown here.
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
                        <p className="text-xs text-zinc-500 md:text-sm">{row.customer.phoneNumber}</p>
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Quantity</label>
                        <input
                          ref={(element) => {
                            bulkQuantityRefs.current[index] = element;
                          }}
                          type="number"
                          min={0}
                          value={bulkQuantities[row.customer.id] ?? 0}
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
                              [row.customer.id]: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm md:rounded-2xl md:px-4 md:py-3"
                          placeholder="0"
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
                  {selectedBreadItem ? selectedBreadItem.name : "No bread selected"}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {selectedBreadItem ? `Unit price: $${selectedBreadPrice.toFixed(2)}` : "Choose a bread item to continue."}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}