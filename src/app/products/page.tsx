'use client';
import { useEffect, useState } from "react";
import ProductRow from "@/components/products/productRows";

type Product = {
  id: number;
  name: string;
  category: "BREAD" | "FASTF" | "CAKE";
  price: number | string;
};

type GetProductsResponse = {
  message: string;
  products: Product[];
};

export default function ProductPage() {
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice,setProductPrice]  =useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/product", { method: "GET" });
        const data: GetProductsResponse = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to fetch products");
          return;
        }

        setProducts(data.products);
      } catch {
        setMessage("Failed to load products");
      }
    };

    void loadProducts();
  }, []);

  const handleEditProduct = async (product: Product) => {
    const nextName = window.prompt("Edit product name", product.name);
    if (nextName === null) {
      return;
    }

    const trimmedName = nextName.trim();
    if (!trimmedName) {
      setMessage("Product name cannot be empty.");
      return;
    }

    const nextCategory = window.prompt("Edit category (BREAD, FASTF, CAKE)", product.category);
    if (nextCategory === null) {
      return;
    }

    const normalizedCategory = nextCategory.trim().toUpperCase();
    if (normalizedCategory !== "BREAD" && normalizedCategory !== "FASTF" && normalizedCategory !== "CAKE") {
      setMessage("Category must be BREAD, FASTF, or CAKE.");
      return;
    }

    const nextPrice = window.prompt("Edit price", String(product.price));
    if (nextPrice === null) {
      return;
    }

    const parsedPrice = Number(nextPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage("Price must be a positive number.");
      return;
    }

    try {
      const res = await fetch(`/api/product/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          category: normalizedCategory,
          price: parsedPrice,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update product");
        return;
      }

      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                name: data.product.name,
                category: data.product.category,
                price: data.product.price,
              }
            : item
        )
      );
      setMessage("Product updated successfully");
    } catch {
      setMessage("Failed to update product");
    }
  };

  const handleDeleteProduct = async (product: Pick<Product, "id" | "name">) => {
    const shouldDelete = window.confirm(`Delete product \"${product.name}\"?`);
    if (!shouldDelete) {
      return;
    }

    try {
      const res = await fetch(`/api/product/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete product");
        return;
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setMessage("Product deleted successfully");
    } catch {
      setMessage("Failed to delete product");
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name:productName,
          category:productCategory,
          price:productPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      setMessage("Product created successfully");
      setProducts((prev) => [
        ...prev,
        {
          id: data.product.id,
          name: data.product.name,
          category: data.product.category,
          price: data.product.price,
        },
      ]);

      setProductName("");
      setProductCategory("");
      setProductPrice("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create Product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,_#fff7ed_0%,_#ffffff_42%,_#ecfeff_100%)] px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr] xl:grid-cols-[420px_1fr]">
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Product</h1>
            <p className="mt-1 text-sm text-zinc-600 sm:text-base">Add product details to your catalog.</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-zinc-200/80 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6"
          >
            <div>
              <label htmlFor="productName" className="mb-1 block text-sm font-medium text-zinc-800">Product Name</label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                required
              />
            </div>
            <div>
              <label htmlFor="productCategory" className="mb-1 block text-sm font-medium text-zinc-800">Category</label>
              <select
                id="productCategory"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                required
              >
                <option value="">Select a category</option>
                <option value="BREAD">Bread</option>
                <option value="FASTF">Fast Food</option>
                <option value="CAKE">Cake</option>
              </select>
            </div>
            <div>
              <label htmlFor="productPrice" className="mb-1 block text-sm font-medium text-zinc-800">Price</label>
              <input
                id="productPrice"
                type="text"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-5 py-3 font-medium text-white shadow-[0_16px_30px_-20px_rgba(24,24,27,0.95)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>

            {message && (
              <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{message}</p>
            )}
          </form>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Products</h2>
              <p className="text-sm text-zinc-600 sm:text-base">View and manage products.</p>
          </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/90 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="grid grid-cols-4 border-b border-zinc-200 bg-gradient-to-r from-zinc-100 to-zinc-50 px-6 py-4 text-sm font-semibold">
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-zinc-200">
              {products.map((product: Product) =>{
                  return (
                  <ProductRow
                  key={product.id}
                  id={product.id}
                  productName={product.name}
                  category={product.category}
                  price={product.price}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  />
              )})}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}