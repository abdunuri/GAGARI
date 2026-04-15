'use client';

import { useState } from "react";

type OrderItemInput = {
  itemId: number,
  unitPrice: number,
  quantity: number,
};

type Customer = {
  id:number,
  name:string,
  phoneNumber:string,
};

type Order = {
  customer:Customer,
  orderItems:OrderItemInput[],
}

type NewOrderResponse = {
  message:string,
  order:Order,
}
type GetCustomerResponse = {
  message: string,
  customers: Customer[],
}


import { useEffect } from "react";

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { itemId: 0, unitPrice: 0, quantity: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customer", { method: "GET" });
        const data: GetCustomerResponse = await res.json();
        setCustomers(data.customers);
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchCustomers();
  }, []);

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
    setOrderItems([
      ...orderItems,
      { itemId: 0, unitPrice: 0, quantity: 1 },
    ]);
  };

  const removeItem = (index: number) => {
    const updated = orderItems.filter((_, i) => i !== index);
    setOrderItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const data : NewOrderResponse= await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      };
      setMessage("Order created successfully");

      setCustomerId("");
      setOrderItems([{ itemId: 0, unitPrice: 0, quantity: 1 }]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">New Order</h1>
        <p className="mb-6 text-zinc-600">Create a new customer order.</p>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Customer ID</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Order Items</h2>

            {orderItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-4"
              >
                <input
                  type="number"
                  placeholder="Item ID"
                  value={item.itemId}
                  onChange={(e) =>
                    handleItemChange(index, "itemId", Number(e.target.value))
                  }
                  className="rounded-xl border px-3 py-2"
                  required
                />

                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, "unitPrice", Number(e.target.value))
                  }
                  className="rounded-xl border px-3 py-2"
                  required
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                  className="rounded-xl border px-3 py-2"
                  required
                />

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-xl bg-red-500 px-4 py-2 text-white"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-white"
            >
              Add Item
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Order"}
          </button>

          {message && (
            <p className="text-sm text-zinc-700">{message}</p>
          )}
        </form>
      </section>
    </main>
  );
}