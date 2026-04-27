"use client";

import { useEffect, useState } from "react";
import { resolveLocaleFromCookieString, type Locale } from "@/lib/locales";

export function useClientLocale(fallback: Locale = "am") {
  // Keep the initial render deterministic to avoid hydration mismatch.
  const [locale, setLocale] = useState<Locale>(fallback);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    setLocale(resolveLocaleFromCookieString(document.cookie, fallback));
  }, [fallback]);

  return locale;
}