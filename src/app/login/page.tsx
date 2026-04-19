"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { LayoutBottomIcon } from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const lgocheck = async function logdet() {
      const session = await authClient.getSession()
      if (session) {
        router.replace("/dashboard")
      }
    }

    lgocheck()
  }, [router])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,_#faf5f0_0%,_#ffffff_45%,_#f4f1eb_100%)] px-4 py-6 sm:px-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} className="size-4" />
          </div>
          Gagari plc
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
