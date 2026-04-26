import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins/username";

function normalizeUrl(value: string | undefined): string | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed.replace(/\/$/, "");
    }

    return `https://${trimmed}`.replace(/\/$/, "");
}

const explicitAuthUrl = normalizeUrl(process.env["BETTER_AUTH_URL"]);
const vercelDeploymentUrl = normalizeUrl(process.env["VERCEL_URL"]);
const localDevUrl = "http://localhost:3000";

const trustedOrigins = Array.from(
    new Set([
        explicitAuthUrl,
        vercelDeploymentUrl,
        localDevUrl,
    ].filter((value): value is string => Boolean(value)))
);

export const auth = betterAuth({
    ...(explicitAuthUrl ? { baseURL: explicitAuthUrl } : {}),
    trustedOrigins,
    database:prismaAdapter(prisma,{
        provider:"postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "STAFF",
            },
            username:{
                type:"string",
                required: false,
                defaultValue:""

            },
            bakeryId:{
                type:"number",
                required:false,
            }
        },
    },
    emailAndPassword : {
        enabled : true,
        autoSignIn: false,
    },
    plugins:[nextCookies(),username()],
});
