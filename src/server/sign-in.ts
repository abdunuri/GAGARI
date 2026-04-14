import { authClient } from "../lib/auth-client"


export async function SignIn(email:string,password:string){

    const { data, error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
            rememberMe: true
    }, {
        //callbacks
    })
}