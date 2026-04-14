import { auth } from "@/lib/auth";

type SignUpData = {
    email:string,
    password:string,
    name:string,
    role:string,
    username:string
}

export async function SignUp(signupdata:SignUpData){

    const response = await auth.api.signUpEmail({
        body: {
            email: signupdata.email,
            password: signupdata.password,
            name: signupdata.name,
            role: signupdata.role,
            username: signupdata.username,
            callbackURL: "/dahboard",
        },
    });

    return response;
}