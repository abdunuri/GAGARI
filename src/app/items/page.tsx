'use client';
import { useEffect, useState } from "react";
import ItemRow from "@/components/items/itemRows";

type Item = {
  id: number;
  name: string;
  category: "BREAD" | "FASTF" | "CAKE";
  price: number | string;
};

type GetItemsResponse = {
  message: string;
  items: Item[];
};

export default function ItemPage() {
  const [ItemName, setItemName] = useState("");
  const [ItemCategory, setItemCategory] = useState("");
  const [ItemPrice,setItemPrice]  =useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [Items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await fetch("/api/item", { method: "GET" });
        const data: GetItemsResponse = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch items");
        }

        setItems(data.items);
      } catch {
        setMessage("Failed to load items");
      }
    };

    void loadItems();
  }, []);
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name:ItemName,
          category:ItemCategory,
          price:ItemPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Item created successfully");
      setItems((prev) => [
        ...prev,
        {
          id: data.item.id,
          name: data.item.name,
          category: data.item.category,
          price: data.item.price,
        },
      ]);

      setItemName("");
      setItemCategory("");
      setItemPrice("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create Item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Item</h1>
        <p className="mb-6 text-sm text-zinc-600 sm:text-base">Create a new item.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">Item Name</label>
            <input
              type="text"
              value={ItemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">Category</label>
            <input
              type="text"
              value={ItemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-800">Price</label>
            <input
              type="text"
              value={ItemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
              required
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Creating..." : "Create Item"}
          </button>

          {message && (
            <p className="text-sm text-zinc-700">{message}</p>
          )}
        </form>
      </section>
      <section className="mx-auto mt-10 flex max-w-6xl flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Items</h2>
              <p className="text-sm text-zinc-600 sm:text-base">View and manage items.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-3 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold md:grid">
            <span>Item Name</span>
            <span>Item Category</span>
            <span>Item Price</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {Items.map((Item: Item) =>{
                return (
                <ItemRow
                key={Item.id}
                ItemName={Item.name}
                category={Item.category}
                price={Item.price}
                />
            )})}
          </div>
        </div>
      </section>

    </main>
  );
}