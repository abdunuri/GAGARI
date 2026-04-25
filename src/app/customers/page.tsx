'use client';
import { useEffect, useState } from "react";
import CustomerRow from "@/components/customers/customerRow";

type Customer = {
  id: number;
  name: string;
  phoneNumber: string;
};

type GetCustomersResponse = {
  message: string;
  customers: Customer[];
};

export default function CustomerPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch("/api/customer", { method: "GET" });
        const data: GetCustomersResponse = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to fetch customers");
          return;
        }

        setCustomers(data.customers);
      } catch {
        setMessage("Failed to load customers");
      }
    };

    void loadCustomers();
  }, []);

  const handleEditCustomer = async (customer: Customer) => {
    const nextName = window.prompt("Edit customer name", customer.name);
    if (nextName === null) {
      return;
    }

    const trimmedName = nextName.trim();
    if (!trimmedName) {
      setMessage("Customer name cannot be empty.");
      return;
    }

    const nextPhone = window.prompt("Edit phone number", customer.phoneNumber);
    if (nextPhone === null) {
      return;
    }

    const trimmedPhone = nextPhone.trim();
    if (!trimmedPhone) {
      setMessage("Phone number cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`/api/customer/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          phoneNumber: trimmedPhone,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update customer");
        return;
      }

      setCustomers((prev) =>
        prev.map((item) =>
          item.id === customer.id
            ? { ...item, name: data.customer.name, phoneNumber: data.customer.phoneNumber }
            : item
        )
      );
      setMessage("Customer updated successfully");
    } catch {
      setMessage("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async (customer: Pick<Customer, "id" | "name">) => {
    const shouldDelete = window.confirm(`Delete customer \"${customer.name}\"?`);
    if (!shouldDelete) {
      return;
    }

    try {
      const res = await fetch(`/api/customer/${customer.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to delete customer");
        return;
      }

      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
      setMessage("Customer deleted successfully");
    } catch {
      setMessage("Failed to delete customer");
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
        setMessage(data.message || "Something went wrong");
        return;
      }

      setMessage("Customer created successfully");
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
        error instanceof Error ? error.message : "Failed to create customer"
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Customer</h1>
            <p className="mt-1 text-sm text-zinc-600 sm:text-base">Create a new customer profile.</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div>
              <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-zinc-800">Customer Name</label>
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
              <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium text-zinc-800">Phone Number</label>
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
              {loading ? "Creating..." : "Create customer"}
            </button>

            {message && (
              <p className="text-sm text-zinc-700">{message}</p>
            )}
          </form>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Customers</h2>
              <p className="text-sm text-zinc-600 sm:text-base">View and manage customers.</p>
          </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold">
              <span>Customer Name</span>
              <span>Phone Number</span>
              <span className="text-right">Actions</span>
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

    </main>
  );
}