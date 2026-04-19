import { authClient } from "@/lib/auth-client";

type SignUpData = {
    email:string,
    password:string,
    name:string,
    role:"ADMIN" | "OWNER" | "STAFF" | "VIEWER",
    username:string,
    currentUserRole:"ADMIN" | "OWNER"
}

const ROLE_OPTIONS = {
    ADMIN: ["ADMIN", "OWNER", "STAFF", "VIEWER"],
    OWNER: ["STAFF", "VIEWER"],
} as const

export async function SignUp(signupdata:SignUpData){
    try {
        const allowedRoles = ROLE_OPTIONS[signupdata.currentUserRole] as readonly SignUpData["role"][]

        if (!allowedRoles.includes(signupdata.role)) {
            throw new Error(`Role ${signupdata.role} is not allowed for ${signupdata.currentUserRole.toLowerCase()}`)
        }

        const response = await authClient.signUp.email({
            email: signupdata.email,
            password: signupdata.password,
            name: signupdata.name,
            username: signupdata.username,
            role: signupdata.role,
            callbackURL: "/dashboard",
            bakeryId: ""
        });

        return response;
    } catch (error) {
        console.error("SignUp failed", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`SignUp failed: ${message}`, { cause: error });
    }
}