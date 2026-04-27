'use client';
import { useEffect, useState } from "react";
import ProductRow from "@/components/products/productRows";
import { getProductsPageCopy } from "@/lib/i18n/products";
import { useClientLocale } from "@/lib/use-client-locale";

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
  const locale = useClientLocale();
  const copy = getProductsPageCopy(locale);

  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice,setProductPrice]  =useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<"BREAD" | "FASTF" | "CAKE" | "">("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/product", { method: "GET" });
        const data: GetProductsResponse = await res.json();

        if (!res.ok) {
          setMessage(data.message || copy.messages.fetchFailed);
          return;
        }

        setProducts(data.products);
      } catch {
        setMessage(copy.messages.loadFailed);
      }
    };

    void loadProducts();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditPrice(String(product.price));
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditName("");
    setEditCategory("");
    setEditPrice("");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) {
      return;
    }

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setMessage(copy.messages.emptyName);
      return;
    }

    if (editCategory !== "BREAD" && editCategory !== "FASTF" && editCategory !== "CAKE") {
      setMessage(copy.messages.invalidCategory);
      return;
    }

    const parsedPrice = Number(editPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage(copy.messages.invalidPrice);
      return;
    }

    try {
      const res = await fetch(`/api/product/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          category: editCategory,
          price: parsedPrice,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || copy.messages.updateFailed);
        return;
      }

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: data.product.name,
                category: data.product.category,
                price: data.product.price,
              }
            : item
        )
      );
      setMessage(copy.messages.updateSuccess);
      handleCancelEdit();
    } catch {
      setMessage(copy.messages.updateFailed);
    }
  };

  const handleDeleteProduct = async (product: Pick<Product, "id" | "name">) => {
    const shouldDelete = window.confirm(copy.actions.deleteConfirm.replace("{name}", product.name));
    if (!shouldDelete) {
      return;
    }

    try {
      const res = await fetch(`/api/product/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || copy.messages.deleteFailed);
        return;
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setMessage(copy.messages.deleteSuccess);
    } catch {
      setMessage(copy.messages.deleteFailed);
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
        setMessage(data.message || copy.messages.generic);
        return;
      }

      setMessage(copy.messages.createSuccess);
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
        error instanceof Error ? error.message : copy.messages.createFailed
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.title}</h1>
            <p className="mt-1 text-sm text-zinc-600 sm:text-base">{copy.subtitle}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-zinc-200/80 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6"
          >
            <div>
              <label htmlFor="productName" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.productName}</label>
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
              <label htmlFor="productCategory" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.category}</label>
              <select
                id="productCategory"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                required
              >
                <option value="">{copy.fields.selectCategory}</option>
                <option value="BREAD">{copy.fields.bread}</option>
                <option value="FASTF">{copy.fields.fastFood}</option>
                <option value="CAKE">{copy.fields.cake}</option>
              </select>
            </div>
            <div>
              <label htmlFor="productPrice" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.price}</label>
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
              {loading ? copy.actions.creating : copy.actions.create}
            </button>

            {message && (
              <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">{message}</p>
            )}
          </form>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.list.title}</h2>
              <p className="text-sm text-zinc-600 sm:text-base">{copy.list.subtitle}</p>
          </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/90 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="grid grid-cols-4 border-b border-zinc-200 bg-gradient-to-r from-zinc-100 to-zinc-50 px-6 py-4 text-sm font-semibold">
              <span>{copy.list.columns.product}</span>
              <span>{copy.list.columns.category}</span>
              <span>{copy.list.columns.price}</span>
              <span className="text-right">{copy.list.columns.actions}</span>
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

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={handleSaveProduct}
            className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{copy.actions.edit}</h2>
              <p className="mt-1 text-sm text-zinc-600">{copy.actions.editSubtitle}</p>
            </div>

            <div>
              <label htmlFor="editProductName" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.productName}</label>
              <input
                id="editProductName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              />
            </div>

            <div>
              <label htmlFor="editProductCategory" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.category}</label>
              <select
                id="editProductCategory"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as "BREAD" | "FASTF" | "CAKE" | "")}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              >
                <option value="">{copy.fields.selectCategory}</option>
                <option value="BREAD">{copy.fields.bread}</option>
                <option value="FASTF">{copy.fields.fastFood}</option>
                <option value="CAKE">{copy.fields.cake}</option>
              </select>
            </div>

            <div>
              <label htmlFor="editProductPrice" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.price}</label>
              <input
                id="editProductPrice"
                type="text"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                {copy.actions.cancel}
              </button>
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                {copy.actions.saveChanges}
              </button>
            </div>
          </form>
        </div>
      )}

    </main>
  );
}