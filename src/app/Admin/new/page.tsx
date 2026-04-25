"use client";

import { FormEvent, useState } from "react";

type CreateResult = {
	message: string;
	bakery?: {
		id: number;
		name: string;
		ownerId: string | null;
	};
	owner?: {
		id: string;
		name: string;
		email: string | null;
	};
};

export default function NewAdminPage() {
	const [bakeryName, setBakeryName] = useState("");
	const [ownerName, setOwnerName] = useState("");
	const [ownerUsername, setOwnerUsername] = useState("");
	const [ownerEmail, setOwnerEmail] = useState("");
	const [ownerPassword, setOwnerPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [success, setSuccess] = useState<CreateResult | null>(null);

	const resetForm = () => {
		setBakeryName("");
		setOwnerName("");
		setOwnerUsername("");
		setOwnerEmail("");
		setOwnerPassword("");
	};

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage("");
		setSuccess(null);
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/admin/new", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					bakeryName,
					ownerName,
					ownerUsername,
					ownerEmail,
					ownerPassword,
				}),
			});

			const data = (await response.json()) as CreateResult;
			if (!response.ok) {
				setErrorMessage(data.message || "Failed to create bakery and owner.");
				return;
			}

			setSuccess(data);
			resetForm();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Failed to create bakery and owner.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
				<p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Create Bakery + Owner</p>
				<h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">New Bakery Account Setup</h1>
				<p className="mt-2 text-sm text-zinc-600">
					This single form creates the bakery first, creates the owner with that bakery ID, then links the bakery owner.
				</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-6">
				<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
					<h2 className="text-lg font-semibold text-zinc-900">Bakery Details</h2>
					<p className="mt-1 text-sm text-zinc-500">Enter information for the bakery record.</p>

					<div className="mt-4 grid gap-4">
						<label className="space-y-1.5">
							<span className="text-sm font-medium text-zinc-700">Bakery Name</span>
							<input
								type="text"
								value={bakeryName}
								onChange={(event) => setBakeryName(event.target.value)}
								required
								placeholder="e.g. Sunrise Bakery"
								className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/20 transition focus:border-zinc-900 focus:ring"
							/>
						</label>
					</div>
				</div>

				<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
					<h2 className="text-lg font-semibold text-zinc-900">Owner Account Details</h2>
					<p className="mt-1 text-sm text-zinc-500">These details are used to create the owner user account.</p>

					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<label className="space-y-1.5 sm:col-span-2">
							<span className="text-sm font-medium text-zinc-700">Full Name</span>
							<input
								type="text"
								value={ownerName}
								onChange={(event) => setOwnerName(event.target.value)}
								required
								placeholder="e.g. Hana Tesfaye"
								className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/20 transition focus:border-zinc-900 focus:ring"
							/>
						</label>

						<label className="space-y-1.5">
							<span className="text-sm font-medium text-zinc-700">Username</span>
							<input
								type="text"
								value={ownerUsername}
								onChange={(event) => setOwnerUsername(event.target.value)}
								required
								placeholder="owner_username"
								className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/20 transition focus:border-zinc-900 focus:ring"
							/>
						</label>

						<label className="space-y-1.5">
							<span className="text-sm font-medium text-zinc-700">Email</span>
							<input
								type="email"
								value={ownerEmail}
								onChange={(event) => setOwnerEmail(event.target.value)}
								required
								placeholder="owner@bakery.com"
								className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/20 transition focus:border-zinc-900 focus:ring"
							/>
						</label>

						<label className="space-y-1.5 sm:col-span-2">
							<span className="text-sm font-medium text-zinc-700">Password</span>
							<input
								type="password"
								value={ownerPassword}
								onChange={(event) => setOwnerPassword(event.target.value)}
								required
								minLength={8}
								placeholder="At least 8 characters"
								className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900/20 transition focus:border-zinc-900 focus:ring"
							/>
						</label>
					</div>
				</div>

				<div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Creating..." : "Create Bakery and Owner"}
					</button>

					{errorMessage ? (
						<p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
					) : null}

					{success ? (
						<div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
							<p className="font-semibold">{success.message}</p>
							<p className="mt-1">
								Bakery #{success.bakery?.id} ({success.bakery?.name}) linked to owner {success.owner?.name} ({success.owner?.email}).
							</p>
						</div>
					) : null}
				</div>
			</form>
		</section>
	);
}
