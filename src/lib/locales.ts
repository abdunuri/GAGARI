export const localeCookieName = "gagari-locale";

export const supportedLocales = ["en", "am"] as const;

export type Locale = (typeof supportedLocales)[number];

export function resolveLocale(value: string | null | undefined, fallback: Locale = "am"): Locale {
  if (value === "am" || value === "en") {
    return value;
  }

  return fallback;
}

export function resolveLocaleFromCookieString(
  cookieString: string | null | undefined,
  fallback: Locale = "am"
): Locale {
  if (!cookieString) {
    return fallback;
  }

  const escapedCookieName = localeCookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cookieMatch = cookieString.match(new RegExp(`(?:^|;\\s*)${escapedCookieName}=([^;]+)`));
  return resolveLocale(cookieMatch?.[1], fallback);
}

export function localeToIntl(locale: Locale) {
  return locale === "am" ? "am-ET" : "en-US";
}