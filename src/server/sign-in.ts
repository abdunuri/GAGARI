import { authClient } from "../lib/auth-client"
import { getAuthErrorMessage } from "@/lib/auth-error-message"


export async function SignIn(email:string,password:string){
    try {
        const { data, error } = await authClient.signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
                rememberMe: true
        })

        if (error) {
            throw new Error(getAuthErrorMessage(error, "signin"))
        }

        return data
    } catch (error) {
        throw new Error(getAuthErrorMessage(error, "signin"), { cause: error })
    }
};