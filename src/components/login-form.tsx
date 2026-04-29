"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SignIn, SignInWithUsername } from "@/server/sign-in"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [loginMode, setLoginMode] = useState<"username" | "email">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [signInError, setSignInError] = useState("")
  const [signInSuccess, setSignInSuccess] = useState("")

  const switchLoginMode = () => {
    setLoginMode((current) => (current === "email" ? "username" : "email"))
    setSignInError("")
    setSignInSuccess("")
  }

  useEffect(() => {
    if (!signInSuccess) {
      return
    }

    const timeout = window.setTimeout(() => {
      setSignInSuccess("")
    }, 4000)

    return () => window.clearTimeout(timeout)
  }, [signInSuccess])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-sm">
        <CardHeader className="px-5 text-center sm:px-6">
          <CardTitle className="text-xl">Bakery staff login</CardTitle>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setSignInError("")
              setSignInSuccess("")
              setIsLoading(true)
              try {
                const result =
                  loginMode === "username"
                    ? await SignInWithUsername(username, password)
                    : await SignIn(email, password)

                if (!result.ok) {
                  setSignInError(result.message)
                  return
                }
                setSignInSuccess("Login successful. Redirecting to your bakery dashboard...")
                router.push("/dashboard")
                router.refresh()
              } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to sign in. Please try again."
                setSignInError(message)
              } finally {
                setIsLoading(false)
              }
            }}
          >
            <FieldGroup>
              {loginMode === "username" ? (
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    placeholder="bakery_username"
                    required
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="staff@gagari.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              )}
              <Field>
                <div className="flex items-center gap-3">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot bakery password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={switchLoginMode}
                  className="w-fit text-sm underline-offset-4 hover:underline"
                >
                  {loginMode === "email" ? "Use username instead" : "Use email instead"}
                </button>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in to bakery dashboard"}
                </Button>
                {signInError ? (
                  <FieldError className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-red-700">
                    {signInError}
                  </FieldError>
                ) : null}
                {signInSuccess ? (
                  <FieldDescription
                    role="status"
                    className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-emerald-700"
                  >
                    {signInSuccess}
                  </FieldDescription>
                ) : null}
                <FieldDescription className="text-center">
                  Ask your bakery admin for an account if you do not have login access yet.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-5 text-center sm:px-6">
        Use your bakery account to continue. <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a> still apply.
      </FieldDescription>
    </div>
  )
}
