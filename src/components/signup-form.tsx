"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { useEffect, useState } from "react"

type SignupContext = "BOOTSTRAP" | "SYSTEM_ADMIN" | "OWNER"
type Role = "SYSTEM_ADMIN" | "ADMIN" | "OWNER" | "STAFF" | "VIEWER"

const ROLE_OPTIONS: Record<SignupContext, Role[]> = {
  BOOTSTRAP: ["SYSTEM_ADMIN"],
  SYSTEM_ADMIN: ["ADMIN", "OWNER", "STAFF", "VIEWER"],
  OWNER: ["STAFF", "VIEWER"],
}

export function SignupForm({
  className,
  currentUserRole,
  currentBakeryId,
  ...props
}: React.ComponentProps<"div"> & { currentUserRole: SignupContext; currentBakeryId: number | null }) {
  const availableRoles = ROLE_OPTIONS[currentUserRole]
  const [email,setEmail] = useState("");
  const [name,setName] = useState("")
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [role,setRole] = useState<Role>(availableRoles[0]);
  const [username,setUsername] = useState("")
  const [bakeryId, setBakeryId] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (currentUserRole === "SYSTEM_ADMIN") {
      setBakeryId("")
    }
  }, [currentUserRole])

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [success]);


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-sm">
        <CardHeader className="px-5 text-center sm:px-6">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          <form onSubmit={async (e) =>{
            e.preventDefault();
            setError("");
            setSuccess("");

            if (confirmPassword !== password) {
              setError("Passwords do not match.");
              return;
            }

            const parsedBakeryId = Number.parseInt(bakeryId.trim(), 10);
            const resolvedBakeryId =
              currentUserRole === "OWNER"
                ? currentBakeryId
                : currentUserRole === "BOOTSTRAP"
                  ? null
                  : Number.isInteger(parsedBakeryId) && parsedBakeryId > 0
                    ? parsedBakeryId
                    : null;

            if (currentUserRole === "SYSTEM_ADMIN" && resolvedBakeryId === null) {
              setError("Bakery ID is required when system admin creates bakery users.");
              return;
            }

            if (currentUserRole === "OWNER" && resolvedBakeryId === null) {
              setError("Your bakery ID could not be determined. Please contact an administrator.");
              return;
            }

            try {
              setLoading(true);
              const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                email:email,
                password:password,
                role:role,
                username:username,
                name:name,
                currentUserRole,
                bakeryId: resolvedBakeryId ?? undefined,
                }),
              });

              const result = (await response.json()) as { message?: string };
              if (!response.ok) {
                throw new Error(result.message ?? "Sign up failed. Please try again.");
              }

              setSuccess("Account created successfully. Please sign in with the new account.");
            } catch (err) {
              const message = err instanceof Error ? err.message : "Sign up failed. Please try again.";
              setError(message);
            } finally {
              setLoading(false);
            }
          }}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" type="text" placeholder="Abdu Nuri" required
                        value={name} onChange={(e) =>(setName(e.target.value))} />
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input id="username" type="text" placeholder="abdunuri" required
                        value={username} onChange={(e) =>(setUsername(e.target.value))} />
              </Field>              
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => (setEmail(e.target.value))}
                />
              </Field>
                  <Field>
                    <FieldLabel htmlFor="role">Role</FieldLabel>
                    <select id="role"  required className="w-full rounded-xl border px-3 py-2"
                    value={role} onChange={(e)=> (setRole(e.target.value as Role))}>
                      {availableRoles.map((option) => (
                        <option key={option} value={option} className="divide-y divide-zinc-200">
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {currentUserRole === "SYSTEM_ADMIN" ? (
                    <Field>
                      <FieldLabel htmlFor="bakeryId">Bakery ID</FieldLabel>
                      <Input
                        id="bakeryId"
                        type="number"
                        placeholder="1"
                        required
                        value={bakeryId}
                        onChange={(e) => setBakeryId(e.target.value)}
                      />
                      <FieldDescription>
                        Use the bakery ID for the owner or staff account you are creating.
                      </FieldDescription>
                    </Field>
                  ) : null}
                {currentUserRole === "BOOTSTRAP" ? (
                  <FieldDescription className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                    This is the first account in a new database. It will be created as a SYSTEM_ADMIN.
                  </FieldDescription>
                ) : null}
              <Field>
                <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" required minLength={8}
                    value={password} onChange={(e)=> (setPassword(e.target.value))}/>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required
                    value={confirmPassword} 
                    onChange={(e) => (setConfirmPassword(e.target.value))}/>
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                {error ? (
                  <FieldError className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-red-700">
                    {error}
                  </FieldError>
                ) : null}
                {success ? (
                  <FieldDescription
                    role="status"
                    className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-emerald-700"
                  >
                    {success}
                  </FieldDescription>
                ) : null}
                <FieldDescription className="text-center">
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
