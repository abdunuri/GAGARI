import { authClient } from "@/lib/auth-client";

type SignUpData = {
    email:string,
    password:string,
    name:string,
    role:string,
    username:string
}

export async function SignUp(signupdata:SignUpData){

    const response = await authClient.signUp.email({
            email: signupdata.email,
            password: signupdata.password,
            name: signupdata.name,
            username: signupdata.username,
            role: signupdata.role,
            callbackURL: "/dashboard",
    });

    return response;
}