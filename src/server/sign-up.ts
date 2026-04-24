import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-error-message";

type SignUpData = {
    email:string,
    password:string,
    name:string,
    role:"ADMIN" | "OWNER" | "STAFF" | "VIEWER",
    username:string,
    currentUserRole:"ADMIN" | "OWNER",
    bakeryId?: number
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
            ...(signupdata.bakeryId !== undefined ? { bakeryId: signupdata.bakeryId } : {}),
        });

        if (response?.error) {
            throw new Error(getAuthErrorMessage(response.error, "signup"));
        }

        return response;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error, "signup"), { cause: error });
    }
}