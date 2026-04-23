import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    return <>{children}</>;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,_#faf5f0_0%,_#ffffff_45%,_#f4f1eb_100%)] px-4 py-6 sm:px-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <h1 className="text-center text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-center text-sm text-zinc-500">You do not have permission to access this page.</p>
          <p className="text-center text-sm text-zinc-500">Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}