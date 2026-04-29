import { getCurrentSession } from "@/lib/auth-session";
import { CACHE_TAGS, expireCache, readThroughCache } from "@/lib/data-cache";
import { ForbiddenError, HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { parseBakeryId } from "@/lib/session";
import { unstable_cache } from "next/cache";

export type TelegramSettingsInput = {
    botToken: string;
    chatIds: string[] | string;
};

export type TelegramNotificationSettings = {
    botToken: string;
    chatIds: string[];
};

function normalizeChatIds(value: string[] | string) {
    const values = Array.isArray(value) ? value : value.split(",");
    const seen = new Set<string>();
    const chatIds: string[] = [];

    for (const rawValue of values) {
        const chatId = String(rawValue).trim();
        if (!chatId || seen.has(chatId)) {
            continue;
        }

        seen.add(chatId);
        chatIds.push(chatId);
    }

    return chatIds;
}

async function getOwnerBakeryId() {
    const session = await getCurrentSession();

    if (!session) {
        throw new HttpError(401, "You must be signed in.");
    }

    if (session.user.role !== "OWNER") {
        throw new ForbiddenError("Only bakery owners can manage Telegram notifications.");
    }

    const bakeryId = parseBakeryId(session.user.bakeryId);
    if (!bakeryId) {
        throw new ForbiddenError("Your account is not linked to a bakery.");
    }

    return bakeryId;
}

const queryTelegramSettingsByBakery = async (bakeryId: number) => {
    return prisma.telegramSettings.findUnique({
        where: {
            bakeryId,
        },
        select: {
            botToken: true,
            chatIds: true,
        },
    });
};

const getCachedTelegramSettingsByBakery = unstable_cache(
    queryTelegramSettingsByBakery,
    ["telegram-settings-by-bakery"],
    {
        tags: [CACHE_TAGS.telegramSettings],
        revalidate: 60,
    }
);

export async function getTelegramSettingsForOwner() {
    const bakeryId = await getOwnerBakeryId();
    return readThroughCache(
        () => getCachedTelegramSettingsByBakery(bakeryId),
        () => queryTelegramSettingsByBakery(bakeryId)
    );
}

export async function getTelegramSettingsForBakery(bakeryId: number): Promise<TelegramNotificationSettings | null> {
    const settings = await readThroughCache(
        () => getCachedTelegramSettingsByBakery(bakeryId),
        () => queryTelegramSettingsByBakery(bakeryId)
    );

    if (!settings?.botToken || settings.chatIds.length === 0) {
        return null;
    }

    return settings;
}

export async function upsertTelegramSettingsForOwner(input: TelegramSettingsInput) {
    const bakeryId = await getOwnerBakeryId();
    const botToken = input.botToken.trim();
    const chatIds = normalizeChatIds(input.chatIds);

    if (!botToken) {
        throw new HttpError(400, "Telegram bot token is required.");
    }

    if (chatIds.length === 0) {
        throw new HttpError(400, "Add at least one Telegram chat id.");
    }

    const settings = await prisma.telegramSettings.upsert({
        where: {
            bakeryId,
        },
        create: {
            bakeryId,
            botToken,
            chatIds,
        },
        update: {
            botToken,
            chatIds,
        },
        select: {
            botToken: true,
            chatIds: true,
        },
    });

    expireCache([CACHE_TAGS.telegramSettings], ["/dashboard"]);

    return settings;
}
