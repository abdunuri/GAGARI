import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
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
        },
    },
    emailAndPassword : {
        enabled : true,
    },
    plugins:[nextCookies()]
});
