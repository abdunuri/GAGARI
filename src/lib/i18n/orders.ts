import type { Locale } from "@/lib/locales";

export const ordersPageCopy = {
  en: {
    title: "Orders",
    subtitle: "View and manage customer orders.",
    newOrder: "New Order",
    table: {
      customerOrBatch: "Customer / Batch",
      total: "Total",
      status: "Status",
    },
    stats: {
      totalOrders: "Total Orders",
      pending: "Pending",
      paid: "Paid",
    },
    bulk: {
      titlePrefix: "Bulk Order",
      titleSuffix: "orders",
    },
  },
  am: {
    title: "ትዕዛዞች",
    subtitle: "የደንበኛ ትዕዛዞችን ይመልከቱ እና ያስተዳድሩ።",
    newOrder: "አዲስ ትዕዛዝ",
    table: {
      customerOrBatch: "ደንበኛ / ቡድን",
      total: "ጠቅላላ",
      status: "ሁኔታ",
    },
    stats: {
      totalOrders: "ጠቅላላ ትዕዛዞች",
      pending: "በመጠባበቅ",
      paid: "የተከፈለ",
    },
    bulk: {
      titlePrefix: "የቡድን ትዕዛዝ",
      titleSuffix: "ትዕዛዞች",
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getOrdersPageCopy(locale: Locale) {
  return ordersPageCopy[locale];
}
