import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SignupForm } from "@/components/signup-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { LayoutBottomIcon } from "@hugeicons/core-free-icons"
import { headers } from "next/headers"

type SignupContext = "BOOTSTRAP" | "SYSTEM_ADMIN" | "OWNER"

export const dynamic = "force-dynamic"

export default async function SignupPage() {
  const userCount = await prisma.user.count()
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const currentBakeryId = session?.user.bakeryId ?? null

  const currentUserRole: SignupContext =
    userCount === 0 ? "BOOTSTRAP" : session?.user.role === "SYSTEM_ADMIN" ? "SYSTEM_ADMIN" : "OWNER"

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,_#faf5f0_0%,_#ffffff_45%,_#f4f1eb_100%)] px-4 py-6 sm:px-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} className="size-4" />
          </div>
          GaGari Plc
        </a>
        <SignupForm currentUserRole={currentUserRole} currentBakeryId={currentBakeryId} />
      </div>
    </div>
  )
}
