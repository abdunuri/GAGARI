import type { Locale } from "@/lib/locales";

export const shellCopy = {
  en: {
    subtitle: "Bakery operations built for mobile-first teams.",
    nav: {
      dashboard: "Dashboard",
      customers: "Customers",
      products: "Products",
      orders: "Orders",
      newOrder: "New Order",
    },
    signOut: "Sign out",
  },
  am: {
    subtitle: "ለሞባይል-መጀመሪያ ቡድኖች የተሰራ የቤኬሪ ስራ አስተዳደር።",
    nav: {
      dashboard: "ዳሽቦርድ",
      customers: "ደንበኞች",
      products: "ምርቶች",
      orders: "ትዕዛዞች",
      newOrder: "አዲስ ትዕዛዝ",
    },
    signOut: "ውጣ",
  },
} as const satisfies Record<Locale, unknown>;

export function getShellCopy(locale: Locale) {
  return shellCopy[locale];
}
