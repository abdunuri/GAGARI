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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SignIn } from "@/server/sign-in"
import { useState } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [signInError, setSignInError] = useState("")

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-sm">
        <CardHeader className="px-5 text-center sm:px-6">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setSignInError("")
              setIsLoading(true)
              try {
                await SignIn(email, password)
              } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to sign in. Please try again."
                setSignInError(message)
              } finally {
                setIsLoading(false)
              }
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="m@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center gap-3">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                {signInError ? (
                  <FieldDescription className="pt-2 text-center text-red-600">
                    {signInError}
                  </FieldDescription>
                ) : null}
                <FieldDescription className="text-center">
                  Please if you don't have an account, get one from your Bakery Admin.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-5 text-center sm:px-6">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
