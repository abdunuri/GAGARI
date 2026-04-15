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
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">New Item</h1>
        <p className="mb-6 text-zinc-600">Create a new Item.</p>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Item Name</label>
            <input
              type="text"
              value={ItemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              type="text"
              value={ItemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">price</label>
            <input
              type="text"
              value={ItemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Item"}
          </button>

          {message && (
            <p className="text-sm text-zinc-700">{message}</p>
          )}
        </form>
      </section>
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Items</h1>
              <p className="text-zinc-600">View and manage Items.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold">
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