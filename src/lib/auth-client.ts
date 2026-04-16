import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields({
            user: {
                role: {
                    type: "string",
                    required: false,
                    defaultValue: "STAFF",
                },
                username: {
                    type: "string",
                    required: false,
                    defaultValue: "",
                },
                bakeryId: {
                    type: "string",
                    required: true,
                },            },
        }),
    ],
});