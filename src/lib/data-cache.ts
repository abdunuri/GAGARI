import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  admin: "admin",
  bakeries: "bakeries",
  customers: "customers",
  dashboard: "dashboard",
  orders: "orders",
  products: "products",
  telegramSettings: "telegram-settings",
} as const;

type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

function isMissingIncrementalCacheError(error: unknown) {
  return error instanceof Error && error.message.includes("incrementalCache missing");
}

export async function readThroughCache<T>(cachedRead: () => Promise<T>, fallbackRead: () => Promise<T>) {
  try {
    return await cachedRead();
  } catch (error) {
    if (isMissingIncrementalCacheError(error)) {
      return fallbackRead();
    }

    throw error;
  }
}

export function expireCache(tags: CacheTag[], paths: string[] = []) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }
}
