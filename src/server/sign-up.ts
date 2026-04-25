import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage, logServerError } from "@/lib/auth-error-message";

type SignUpData = {
    email:string,
    password:string,
    name:string,
    role:"SYSTEM_ADMIN" | "ADMIN" | "OWNER" | "STAFF" | "VIEWER",
    username:string,
    currentUserRole:"SYSTEM_ADMIN" | "OWNER",
    bakeryId?: number
}

export type SignUpResult =
    | { ok: true; data: unknown }
    | { ok: false; message: string }

const ROLE_OPTIONS = {
    SYSTEM_ADMIN: ["ADMIN", "OWNER", "STAFF", "VIEWER"],
    OWNER: ["STAFF", "VIEWER"],
} as const

export async function SignUp(signupdata:SignUpData){
    try {
        const allowedRoles = ROLE_OPTIONS[signupdata.currentUserRole] as readonly SignUpData["role"][]

        if (!allowedRoles.includes(signupdata.role)) {
            const message = `Role ${signupdata.role} is not allowed for ${signupdata.currentUserRole.toLowerCase()}`
            logServerError("Sign up failed", { message, code: "ROLE_NOT_ALLOWED", status: 403 })
            return {
                ok: false,
                message,
            } satisfies SignUpResult
        }

        const response = await authClient.signUp.email({
            email: signupdata.email,
            password: signupdata.password,
            name: signupdata.name,
            username: signupdata.username,
            role: signupdata.role,
            callbackURL: "/dashboard",
            ...(signupdata.bakeryId !== undefined ? { bakeryId: signupdata.bakeryId } : {}),
        });

        if (response?.error) {
            logServerError("Sign up failed", response.error)
            return {
                ok: false,
                message: getAuthErrorMessage(response.error, "signup"),
            } satisfies SignUpResult
        }

        return {
            ok: true,
            data: response,
        } satisfies SignUpResult;
    } catch (error) {
        logServerError("Sign up failed", error)
        return {
            ok: false,
            message: getAuthErrorMessage(error, "signup"),
        } satisfies SignUpResult;
    }
}