import { auth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import { cookies, headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getLoginPageCopy } from "@/lib/i18n/auth-pages"
import { localeCookieName, resolveLocale } from "@/lib/locales"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value)
  const copy = getLoginPageCopy(locale)

  let session = null
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    session = null
  }

  if (session) {
    if (session.user.role === "SYSTEM_ADMIN") {
      redirect("/Admin")
    }

    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,_#faf5f0_0%,_#ffffff_45%,_#f4f1eb_100%)] px-4 py-6 sm:px-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-3 self-center font-medium">
          <Image
            src="/Gagari_Logo.png"
            alt="GaGari logo"
            width={36}
            height={36}
            className="size-9 rounded-full object-cover shadow-sm"
          />
          <span className="text-base font-semibold tracking-tight">{copy.brand}</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
