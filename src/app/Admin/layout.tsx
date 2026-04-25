import SignOutButton from "@/components/dashboard/SignOutButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	let session = null;
	try {
		session = await auth.api.getSession({
			headers: await headers(),
		});
	} catch {
		session = null;
	}

	if (!session) {
		redirect("/login");
	}

	if (session.user.role !== "SYSTEM_ADMIN") {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen bg-zinc-50 text-zinc-900">
			<header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
					<div>
						<p className="text-xl font-semibold tracking-tight">System Admin</p>
						<p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Platform Control Panel</p>
					</div>

					<nav className="flex items-center gap-2 text-sm">
						<Link
							href="/Admin"
							className="rounded-full border border-zinc-200 bg-white px-4 py-2 font-medium transition hover:border-zinc-300 hover:bg-zinc-900 hover:text-white"
						>
							Overview
						</Link>
						<Link
							href="/Admin/new"
							className="rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-zinc-700"
						>
							New Admin
						</Link>
					</nav>

					<div className="flex items-center gap-3">
						<div className="hidden text-right sm:block">
							<p className="text-sm font-medium text-zinc-900">{session.user.name}</p>
							<p className="text-xs text-zinc-500">{session.user.email}</p>
						</div>
						<SignOutButton />
					</div>
				</div>
			</header>

			<main>{children}</main>
		</div>
	);
}
