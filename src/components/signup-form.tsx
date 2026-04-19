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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { SignUp } from "@/server/sign-up"

type CurrentUserRole = "ADMIN" | "OWNER"
type Role = "ADMIN" | "OWNER" | "STAFF" | "VIEWER"

const ROLE_OPTIONS: Record<CurrentUserRole, Role[]> = {
  ADMIN: ["ADMIN", "OWNER", "STAFF", "VIEWER"],
  OWNER: ["STAFF", "VIEWER"],
}

export function SignupForm({
  className,
  currentUserRole,
  ...props
}: React.ComponentProps<"div"> & { currentUserRole: CurrentUserRole }) {
  const availableRoles = ROLE_OPTIONS[currentUserRole]
  const [email,setEmail] = useState("");
  const [name,setName] = useState("")
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [role,setRole] = useState<Role>(availableRoles[0]);
  const [username,setUsername] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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

            if (confirmPassword !== password) {
              setError("Passwords do not match.");
              return;
            }

            try {
              setLoading(true);
              await SignUp({
                email:email,
                password:password,
                role:role,
                username:username,
                name:name,
                currentUserRole,
              });
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
                  <FieldDescription className="pt-2 text-center text-red-600">
                    {error}
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
