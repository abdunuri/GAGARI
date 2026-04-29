import { HttpError } from "@/lib/errors";
import { getTelegramSettingsForOwner, upsertTelegramSettingsForOwner } from "@/services/telegram-settings.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const settings = await getTelegramSettingsForOwner();
        return NextResponse.json(
            {
                message: "Fetched Telegram settings.",
                settings: settings ?? { botToken: "", chatIds: [] },
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }

        console.error("Failed to fetch Telegram settings", error);
        return NextResponse.json({ message: "Failed to fetch Telegram settings." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body: unknown = await req.json();

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ message: "Validation failed: payload must be an object." }, { status: 400 });
        }

        const input = body as { botToken?: unknown; chatIds?: unknown };

        if (typeof input.botToken !== "string" || !(typeof input.chatIds === "string" || Array.isArray(input.chatIds))) {
            return NextResponse.json(
                { message: "Validation failed: provide a bot token and comma-separated chat ids." },
                { status: 400 }
            );
        }

        const settings = await upsertTelegramSettingsForOwner({
            botToken: input.botToken,
            chatIds: input.chatIds as string | string[],
        });

        return NextResponse.json(
            {
                message: "Telegram settings saved.",
                settings,
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }

        console.error("Failed to save Telegram settings", error);
        return NextResponse.json({ message: "Failed to save Telegram settings." }, { status: 500 });
    }
}
