import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { localeCookieName, localeToIntl, resolveLocale } from "@/lib/locales";
import { getAdminDashboardCopy } from "@/lib/i18n/admin";
import LanguageToggle from "@/components/language-toggle";

export default async function AdminPage() {
	const cookieStore = await cookies();
	const locale = resolveLocale(cookieStore.get(localeCookieName)?.value, "en");
	const copy = getAdminDashboardCopy(locale);
	const localeDate = localeToIntl(locale);

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

	const statValueMap = {
		bakeries: totalBakeries,
		orders: totalOrders,
		pendingOrders: totalPendingOrders,
		products: totalProducts,
		customers: totalCustomers,
		owners: totalOwners,
	} satisfies Record<(typeof copy.stats)[number]["key"], number>;

	const statCards = copy.stats.map((stat) => ({
		...stat,
		value: statValueMap[stat.key] ?? 0,
	}));

	return (
		<section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-900 to-black p-6 text-white shadow-lg sm:p-8">
				<div className="mb-2 flex justify-end">
					<LanguageToggle locale={locale} size="sm" />
				</div>
				<p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
					{copy.heroTag}
				</p>
				<h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.heroTitle}</h1>
				<p className="mt-2 max-w-3xl text-sm text-zinc-200 sm:text-base">
					{copy.heroDescription}
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
							<h2 className="text-xl font-semibold tracking-tight">{copy.bakeries.title}</h2>
							<p className="text-sm text-zinc-500">{copy.bakeries.subtitle}</p>
						</div>
					</div>

					<div className="mt-4 space-y-3">
						{bakeryList.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
								{copy.bakeries.empty}
							</p>
						) : (
							bakeryList.map((bakery) => (
								<div key={bakery.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-base font-semibold text-zinc-900">{bakery.name}</p>
											<p className="mt-1 text-xs text-zinc-500">
												{copy.bakeries.ownerPrefix}: {bakery.owner?.name ?? copy.bakeries.unassigned} ({bakery.owner?.email ?? copy.bakeries.noEmail})
											</p>
										</div>
										<span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">#{bakery.id}</span>
									</div>
									<div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
										<div className="rounded-xl border border-zinc-200 bg-white px-2 py-2">
											<p className="text-zinc-500">{copy.bakeries.orders}</p>
											<p className="font-semibold text-zinc-900">{bakery._count.orders}</p>
										</div>
										<div className="rounded-xl border border-zinc-200 bg-white px-2 py-2">
											<p className="text-zinc-500">{copy.bakeries.customers}</p>
											<p className="font-semibold text-zinc-900">{bakery._count.customers}</p>
										</div>
										<div className="rounded-xl border border-zinc-200 bg-white px-2 py-2">
											<p className="text-zinc-500">{copy.bakeries.products}</p>
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
						<h2 className="text-xl font-semibold tracking-tight">{copy.owners.title}</h2>
						<p className="text-sm text-zinc-500">{copy.owners.subtitle}</p>
					</div>

					<div className="mt-4 space-y-3">
						{ownerList.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
								{copy.owners.empty}
							</p>
						) : (
							ownerList.map((owner) => (
								<div key={owner.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-zinc-900">{owner.name}</p>
												<p className="text-xs text-zinc-500">{owner.email ?? copy.owners.noEmail}</p>
										</div>
										<span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700">
												{owner.ownedBakery?.name ?? copy.owners.noBakery}
										</span>
									</div>
									<p className="mt-2 text-xs text-zinc-500">
											{copy.owners.joined} {new Date(owner.createdAt).toLocaleDateString(localeDate)}
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
