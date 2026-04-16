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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email,setEmail] = useState("");
  const [name,setName] = useState("")
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [role,setRole] = useState("STAFF");
  const [username,setUsername] = useState("")


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
            await SignUp({
              email:email,
              password:password,
              role:role,
              username:username,
              name:name,
            })
          }}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" type="text" placeholder="Abdu Nuri" required
                        value={name} onChange={(e) =>(setName(e.target.value))} />
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Userame</FieldLabel>
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
                    value={role} onChange={(e)=> (setRole(e.target.value))}>
                      <option value={"STAFF"} className="divide-y divide-zinc-200">STAFF</option>
                      <option value={"ADMIN"} className="divide-y divide-zinc-200">ADMIN</option>
                      <option value={"OWNER"} className="divide-y divide-zinc-200">OWNER</option>
                      <option value={"VIEWER"} className="divide-y divide-zinc-200">VIEWER</option>
                    </select>
                  </Field>
              <Field>
                <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" required
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
                <Button type="submit" className="w-full">Create Account</Button>
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
