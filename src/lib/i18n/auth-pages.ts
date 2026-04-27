import type { Locale } from "@/lib/locales";

export const loginPageCopy = {
  en: {
    brand: "GaGari Bakery",
  },
  am: {
    brand: "GaGari ቤኬሪ",
  },
} as const satisfies Record<Locale, unknown>;

export function getLoginPageCopy(locale: Locale) {
  return loginPageCopy[locale];
}

export const signupPageCopy = {
  en: {
    brand: "GaGari Plc",
  },
  am: {
    brand: "GaGari ኃ.የተ.የግ.ማ",
  },
} as const satisfies Record<Locale, unknown>;

export function getSignupPageCopy(locale: Locale) {
  return signupPageCopy[locale];
}
