'use server'
import { auth } from "../lib/auth"; // path to your Better Auth server instance

export const SignIn = async () => {
    await auth.api.signInEmail({
        body: {
            email: "user@example.com",
            password: "yourPassword123",
        },
        asResponse: true, // returns a response object instead of data
    });
}

export const SignUp = async () => {
    await auth.api.signUpEmail({
        body: {
            email: "user@example.com",
            password: "yourPassword123",
            name: "John Doe",
            role: "OWNER",
        },
    });
}

