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
      <section className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New Customer</h1>
        <p className="mb-6 text-sm text-zinc-600 sm:text-base">Create a new customer.</p>

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
            />          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-900 px-5 py-3 font-medium text-white disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Creating..." : "Create customer"}
          </button>

          {message && (
            <p className="text-sm text-zinc-700">{message}</p>
          )}
        </form>
      </section>
      <section className="mx-auto mt-10 flex max-w-6xl flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Customers</h2>
              <p className="text-sm text-zinc-600 sm:text-base">View and manage customers.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-2 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-semibold md:grid">
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