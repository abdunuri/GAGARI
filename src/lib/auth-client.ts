import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
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
                    type: "number",
                    required: false,
                },            },
        }),
    ],
});