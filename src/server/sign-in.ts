import { authClient } from "../lib/auth-client"
import { getAuthErrorMessage, logServerError } from "@/lib/auth-error-message"

export type SignInResult =
    | { ok: true; data: unknown }
    | { ok: false; message: string }

export async function SignIn(email:string,password:string){
    try {
        const { data, error } = await authClient.signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
                rememberMe: true
        })
        if (error){
            const {data,error} = await authClient.signIn.username({
                username:email,
                password,
                callbackURL: "/dashboard",
                rememberMe: true
            })
        }
        if (error) {
            logServerError("Sign in failed", error)
            return {
                ok: false,
                message: getAuthErrorMessage(error, "signin"),
            } satisfies SignInResult
        }

        return {
            ok: true,
            data,
        } satisfies SignInResult
    } catch (error) {
        logServerError("Sign in failed", error)
        return {
            ok: false,
            message: getAuthErrorMessage(error, "signin"),
        } satisfies SignInResult
    }
};