import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
	const [
		totalBakeries,
		totalOrders,
		totalProducts,
		totalCustomers,
		totalOwners,
		totalPendingOrders,
		bakeryList,
		ownerList,
	] = await Promise.all([
		prisma.bakery.count(),
		prisma.order.count(),
		prisma.product.count(),
		prisma.customer.count(),
		prisma.user.count({ where: { role: "OWNER" } }),
		prisma.order.count({ where: { status: "PENDING" } }),
		prisma.bakery.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						orders: true,
						customers: true,
						products: true,
					},
				},
			},
			take: 12,
		}),
		prisma.user.findMany({
			where: { role: "OWNER" },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				ownedBakery: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			take: 12,
		}),
	]);

	const statCards = [
		{ label: "Total Bakeries", value: totalBakeries, hint: "All registered bakery tenants" },
		{ label: "Total Orders", value: totalOrders, hint: "Orders across all bakeries" },
		{ label: "Pending Orders", value: totalPendingOrders, hint: "Orders waiting for completion" },
		{ label: "Total Products", value: totalProducts, hint: "Platform-wide product records" },
		{ label: "Total Customers", value: totalCustomers, hint: "Customer records in all bakeries" },
		{ label: "Total Owners", value: totalOwners, hint: "Users with OWNER role" },
	];

	return (
		<section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-900 to-black p-6 text-white shadow-lg sm:p-8">
				<p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
					Platform Overview
				</p>
				<h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">System Administration</h1>
				<p className="mt-2 max-w-3xl text-sm text-zinc-200 sm:text-base">
					Global metrics and tenant visibility for bakeries, orders, owners, and account growth.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{statCards.map((stat) => (
					<article key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
						<p className="text-sm text-zinc-500">{stat.label}</p>
						<p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{stat.value}</p>
						<p className="mt-1 text-xs text-zinc-500">{stat.hint}</p>
					</article>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold tracking-tight">Bakeries List</h2>
							<p className="text-sm text-zinc-500">Recent bakeries with owner and activity counts.</p>
						</div>
					</div>

					<div className="mt-4 space-y-3">
						{bakeryList.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
								No bakeries found.
							</p>
						) : (
							bakeryList.map((bakery) => (
								<div key={bakery.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-base font-semibold text-zinc-900">{bakery.name}</p>
											<p className="mt-1 text-xs text-zinc-500">
												Owner: {bakery.owner?.name ?? "Unassigned"} ({bakery.owner?.email ?? "No email"})
											</p>
										</div>
										<span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">#{bakery.id}</span>
									</div>
									<div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
										<div className="rounded-xl border border-zinc-200 bg-white px-2 py-2">
											<p className="text-zinc-500">Orders</p>
											<p className="font-semibold text-zinc-900">{bakery._count.orders}</p>
										</div>
										<div className="rounded-xl border border-zinc-200 bg-white px-2 py-2">
											<p className="text-zinc-500">Customers</p>
											<p className="font-semibold text-zinc-900">{bakery._count.customers}</p>
										</div>
										<div className="rounded-xl border border-zinc-200 bg-white px-2 py-2">
											<p className="text-zinc-500">Products</p>
											<p className="font-semibold text-zinc-900">{bakery._count.products}</p>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</article>

				<article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
					<div>
						<h2 className="text-xl font-semibold tracking-tight">Owners List</h2>
						<p className="text-sm text-zinc-500">Recent owner accounts and their assigned bakery.</p>
					</div>

					<div className="mt-4 space-y-3">
						{ownerList.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
								No owners found.
							</p>
						) : (
							ownerList.map((owner) => (
								<div key={owner.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-zinc-900">{owner.name}</p>
											<p className="text-xs text-zinc-500">{owner.email ?? "No email"}</p>
										</div>
										<span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
											{owner.ownedBakery?.name ?? "No bakery"}
										</span>
									</div>
									<p className="mt-2 text-xs text-zinc-500">
										Joined {new Date(owner.createdAt).toLocaleDateString()}
									</p>
								</div>
							))
						)}
					</div>
				</article>
			</div>
		</section>
	);
}
