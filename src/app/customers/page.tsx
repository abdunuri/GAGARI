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
  const [customerPhone, setPhoneNmber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await fetch("/api/customer", { method: "GET" });
        const data: GetCustomersResponse = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch customers");
        }

        setCustomers(data.customers);
      } catch {
        setMessage("Failed to load customers");
      }
    };

    void loadCustomers();
  }, []);
  


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
        throw new Error(data.message || "Something went wrong");
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
      setPhoneNmber("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">New Customer</h1>
        <p className="mb-6 text-zinc-600">Create a new Customer.</p>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
            />
          </div>
                    <div>
            <label className="mb-1 block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setPhoneNmber(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
              required
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create customer"}
          </button>

          {message && (
            <p className="text-sm text-zinc-700">{message}</p>
          )}
        </form>
      </section>
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <p className="text-zinc-600">View and manage customers.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="grid grid-cols-2 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold">
            <span>Customer Name</span>
            <span>Phone Number</span>
          </div>
          <div className="divide-y divide-zinc-200">
            {customers.map((customer: Customer) =>{
                return (
                <CustomerRow
                key={customer.id}
                customerName={customer.name}
                phoneNumber={customer.phoneNumber}/>
            )})}
          </div>
        </div>
      </section>

    </main>
  );
}