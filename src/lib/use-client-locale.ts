"use client";

import { useSyncExternalStore } from "react";
import { resolveLocaleFromCookieString, type Locale } from "@/lib/locales";

const subscribe = () => {
  return () => {};
};

export function useClientLocale(fallback: Locale = "am") {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (typeof document === "undefined") {
        return fallback;
      }

      return resolveLocaleFromCookieString(document.cookie, fallback);
    },
    () => fallback
  );
}
