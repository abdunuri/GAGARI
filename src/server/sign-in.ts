import { NextResponse } from "next/server"
import { authClient } from "../lib/auth-client"


export async function SignIn(email:string,password:string){

    const { data, error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
            rememberMe: true
    })

    if (error) {
        return NextResponse.json(
            { message: error.message || "Authentication failed" },
            { status: 401 }
        )
    }

    return NextResponse.json(
        { message: "Logged in successfully", data },
        { status: 200 }
    )};