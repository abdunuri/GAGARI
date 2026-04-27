'use client';
import { useEffect, useState } from "react";
import CustomerRow from "@/components/customers/customerRow";
import { getCustomersPageCopy } from "@/lib/i18n/customers";
import { useClientLocale } from "@/lib/use-client-locale";

type Customer = {
  id: number;
  name: string;
  phoneNumber: string;
};

type GetCustomersResponse = {
  message: string;
  customers: Customer[];
};

type UpdateCustomerResponse = {
  message?: string;
  customer?: {
    name?: string;
    phoneNumber?: string;
  };
};

async function readJsonResponse<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function CustomerPage() {
  const locale = useClientLocale();
  const copy = getCustomersPageCopy(locale);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch("/api/customer", { method: "GET" });
        const data: GetCustomersResponse = await res.json();

        if (!res.ok) {
          setMessage(data.message || copy.messages.fetchFailed);
          return;
        }

        setCustomers(data.customers);
      } catch {
        setMessage(copy.messages.loadFailed);
      }
    };

    void loadCustomers();
  }, []);

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phoneNumber);
    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditName("");
    setEditPhone("");
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) {
      return;
    }

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setMessage(copy.messages.emptyName);
      return;
    }

    const trimmedPhone = editPhone.trim();
    if (!trimmedPhone) {
      setMessage(copy.messages.emptyPhone);
      return;
    }

    const phoneRegex = /^[+\d][\d\s-]*$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setMessage(copy.messages.invalidPhone);
      return;
    }

    try {
      const res = await fetch(`/api/customer/${editingCustomer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          phoneNumber: trimmedPhone,
        }),
      });
      const data = await readJsonResponse<UpdateCustomerResponse>(res);

      if (!res.ok) {
        setMessage(data?.message || copy.messages.updateFailed);
        return;
      }

      const nextName = data?.customer?.name ?? trimmedName;
      const nextPhone = data?.customer?.phoneNumber ?? trimmedPhone;

      setCustomers((prev) =>
        prev.map((item) =>
          item.id === editingCustomer.id
            ? { ...item, name: nextName, phoneNumber: nextPhone }
            : item
        )
      );
      setMessage(copy.messages.updateSuccess);
      handleCancelEdit();
    } catch {
      setMessage(copy.messages.updateFailed);
    }
  };

  const handleDeleteCustomer = async (customer: Pick<Customer, "id" | "name">) => {
    const shouldDelete = window.confirm(copy.actions.deleteConfirm.replace("{name}", customer.name));
    if (!shouldDelete) {
      return;
    }

    try {
      const res = await fetch(`/api/customer/${customer.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || copy.messages.deleteFailed);
        return;
      }

      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
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
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name:customerName,
          phoneNumber:customerPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || copy.messages.generic);
        return;
      }

      setMessage(copy.messages.createSuccess);
      setCustomers((prev) => [
        ...prev,
        {
          id: data.customer.id,
          name: data.customer.name,
          phoneNumber: data.customer.phoneNumber,
        },
      ]);

      setCustomerName("");
      setPhoneNumber("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : copy.messages.createFailed
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.title}</h1>
            <p className="mt-1 text-sm text-zinc-600 sm:text-base">{copy.subtitle}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div>
              <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.customerName}</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              />
            </div>
            <div>
              <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.phoneNumber}</label>
              <input
                id="customerPhone"
                type="text"
                value={customerPhone}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? copy.actions.creating : copy.actions.create}
            </button>

            {message && (
              <p className="text-sm text-zinc-700">{message}</p>
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

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold">
              <span>{copy.list.columns.customerName}</span>
              <span>{copy.list.columns.phoneNumber}</span>
              <span className="text-right">{copy.list.columns.actions}</span>
            </div>
            <div className="divide-y divide-zinc-200">
              {customers.map((customer: Customer) =>{
                  return (
                  <CustomerRow
                  key={customer.id}
                  id={customer.id}
                  customerName={customer.name}
                  phoneNumber={customer.phoneNumber}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                  />
              )})}
            </div>
          </div>
        </div>
      </section>

      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={handleSaveCustomer}
            className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{copy.actions.edit}</h2>
              <p className="mt-1 text-sm text-zinc-600">{copy.actions.editSubtitle}</p>
            </div>

            <div>
              <label htmlFor="editCustomerName" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.customerName}</label>
              <input
                id="editCustomerName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3"
                required
              />
            </div>

            <div>
              <label htmlFor="editCustomerPhone" className="mb-1 block text-sm font-medium text-zinc-800">{copy.fields.phoneNumber}</label>
              <input
                id="editCustomerPhone"
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
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