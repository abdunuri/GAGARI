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
type Item = {
  id:number,
  name:string,
  price:number|string,
};
type GetItemResponse = {
  message: string,
  items: Item[],
};


import { useEffect } from "react";

export default function NewOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items,setItems]  = useState<Item[]>([]);
  const [unitPrice,setUnitPrice] = useState(0)
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { itemId: 0,unitPrice:unitPrice, quantity: 1 },
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
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/item", { method: "GET" });
        const data: GetItemResponse = await res.json();
        setItems(data.items);
      } catch (error) {
        // Handle error appropriately
      }
    };    fetchCustomers();
    fetchItems();
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
      { itemId: 0,unitPrice:unitPrice, quantity: 1 },
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
      setOrderItems([{ itemId: 0 ,unitPrice:unitPrice, quantity: 1 }]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Order</h1>
        <p className="mb-6 text-sm text-zinc-600 sm:text-base">Create a new customer order.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
        >
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
                  {customer.name} ({customer.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Order Items</h2>

            {orderItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 p-4 md:grid-cols-[minmax(0,1fr)_120px_auto] md:items-end"
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
                      {sitem.name}({sitem.price})
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
                  className="rounded-full bg-red-500 px-4 py-3 font-medium text-white"
                >
                  Remove
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

          {message && (
            <p className="text-sm text-zinc-700">{message}</p>
          )}
        </form>
      </section>
    </main>
  );
}