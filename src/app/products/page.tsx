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
          throw new Error(data.message || "Failed to fetch products");
        }

        setProducts(data.products);
      } catch {
        setMessage("Failed to load products");
      }
    };

    void loadProducts();
  }, []);



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
        throw new Error(data.message || "Something went wrong");
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
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr] xl:grid-cols-[420px_1fr]">
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Product</h1>
            <p className="mt-1 text-sm text-zinc-600 sm:text-base">Add product details to your catalog.</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div>
              <label htmlFor="productName" className="mb-1 block text-sm font-medium text-zinc-800">Product Name</label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label htmlFor="productCategory" className="mb-1 block text-sm font-medium text-zinc-800">Category</label>
              <select
                id="productCategory"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
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
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>

            {message && (
              <p className="text-sm text-zinc-700">{message}</p>
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

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="hidden grid-cols-3 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold md:grid">
              <span>Product Name</span>
              <span>Product Category</span>
              <span>Product Price</span>
            </div>
            <div className="divide-y divide-zinc-200">
              {products.map((product: Product) =>{
                  return (
                  <ProductRow
                  key={product.id}
                  productName={product.name}
                  category={product.category}
                  price={product.price}
                  />
              )})}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}