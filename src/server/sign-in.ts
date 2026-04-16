import { NextResponse } from "next/server"
import { authClient } from "../lib/auth-client"


export async function SignIn(email:string,password:string){

    const { data, error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
            rememberMe: true
    }, {
        //
    })
    return NextResponse.json(
        {message:"Loged in Successfully"},
        {status:200}
    )
}