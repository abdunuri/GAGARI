import type { Locale } from "@/lib/locales";

export const dashboardCopy = {
  en: {
    signedInAs: "Signed in as",
    quickActions: "Quick actions",
    quickActionsDescription: "Common tasks for your role.",
    recentOrders: "Recent orders",
    recentOrdersDescription: "Latest activity in this bakery.",
    createdOn: "Created on",
    unknownCustomer: "Unknown",
    primaryAction: "Start a new order immediately.",
    secondaryAction: "Open the workflow for this task.",
    viewOrders: "View Orders",
    newOrderFallback: "New Order",
    stats: [
      { label: "Customers", hint: "Active bakery customers" },
      { label: "Products", hint: "Catalog entries" },
      { label: "Orders", hint: "All orders" },
      { label: "Pending", hint: "Needs attention" },
    ],
    roleLabels: {
      SYSTEM_ADMIN: "System Admin",
      ADMIN: "Admin",
      OWNER: "Owner",
      STAFF: "Staff",
      VIEWER: "Viewer",
    },
    statusLabels: {
      PENDING: "PENDING",
      PAID: "PAID",
      CANCELLED: "CANCELLED",
      MIXED: "MIXED",
    },
    bulk: {
      titlePrefix: "Bulk Order",
      titleSuffix: "orders",
    },
    staffBulkModal: {
      trigger: "Latest Bulk Run",
      title: "Latest Bulk Batch",
      subtitle: "Staff view for one latest created bulk order with payment and delivery tracking.",
      close: "Close",
      cards: {
        expectedMoney: "Total Expected Money",
        collected: "Total Collected",
        remaining: "Total Remaining",
        paidCustomers: "Paid Customers",
        cashGap: "Cash Gap To Target",
        cashGapHint: "Gap between Current Cash In Van and Real Money In Hand.",
      },
      van: {
        title: "Van Quantity Analysis",
        subtitle: "Enter loaded and left bread quantities to get current cash in van from quantity difference and unit price.",
        loadedProduct: "Loaded Product (Bread)",
        leftBread: "Left Bread",
        delivered: "Delivered",
        currentCashInVan: "Current Cash In Van",
        realMoneyInHand: "Real Money In Hand (Current)",
        emptyPlaceholder: "0",
      },
      analysis: {
        noBulk: "No bulk batch found yet. Create a bulk order from the new order page to start tracking van cash and quantities.",
        enterQuantities: "Add loaded bread and left bread to track current cash in van.",
        invalidLeft: "Left bread cannot be greater than loaded bread. Check the entered values.",
        normal: "All orders are treated as delivered. Collected cash depends on which customers are toggled as PAID.",
      },
      emptyState: "No bulk orders found for your current scope.",
    },
  },
  am: {
    signedInAs: "እንደ ተገቡ",
    quickActions: "ፈጣን እርምጃዎች",
    quickActionsDescription: "ለሚሰሩት ስራ የተለመዱ ተግባሮች።",
    recentOrders: "የቅርብ ትዕዛዞች",
    recentOrdersDescription: "በዚህ ቤኬሪ ያለ የቅርብ እንቅስቃሴ።",
    createdOn: "የተፈጠረው",
    unknownCustomer: "ያልታወቀ",
    primaryAction: "አዲስ ትዕዛዝን በፍጥነት ይጀምሩ።",
    secondaryAction: "ለዚህ ስራ የስራ ሂደቱን ይክፈቱ።",
    viewOrders: "ትዕዛዞችን ይመልከቱ",
    newOrderFallback: "አዲስ ትዕዛዝ",
    stats: [
      { label: "ደንበኞች", hint: "በንቃት ያሉ ደንበኞች" },
      { label: "ምርቶች", hint: "የካታሎግ መዝገቦች" },
      { label: "ትዕዛዞች", hint: "ሁሉም ትዕዛዞች" },
      { label: "በመጠባበቅ", hint: "ትኩረት የሚፈልጉ" },
    ],
    roleLabels: {
      SYSTEM_ADMIN: "የስርዓት አስተዳዳሪ",
      ADMIN: "አስተዳዳሪ",
      OWNER: "ባለቤት",
      STAFF: "ሰራተኛ",
      VIEWER: "ተመልካች",
    },
    statusLabels: {
      PENDING: "በመጠባበቅ",
      PAID: "ተከፍሏል",
      CANCELLED: "ተሰርዟል",
      MIXED: "የተቀላቀለ",
    },
    bulk: {
      titlePrefix: "የቡድን ትዕዛዝ",
      titleSuffix: "ትዕዛዞች",
    },
    staffBulkModal: {
      trigger: "የቅርብ የቡድን ዙር",
      title: "የቅርብ የቡድን ባች",
      subtitle: "ለሰራተኞች የቅርብ ጊዜ የተፈጠረ የቡድን ትዕዛዝን ከክፍያ እና ስርጭት ክትትል ጋር የሚያሳይ እይታ።",
      close: "ዝጋ",
      cards: {
        expectedMoney: "ጠቅላላ የሚጠበቅ ገንዘብ",
        collected: "ጠቅላላ የተሰበሰበ",
        remaining: "ጠቅላላ የቀረ",
        paidCustomers: "የከፈሉ ደንበኞች",
        cashGap: "ከመድረስ የቀረ የገንዘብ ልዩነት",
        cashGapHint: "በመኪና ውስጥ ያለው የአሁን ገንዘብ እና በእጅ ያለው እውነተኛ ገንዘብ መካከል ያለ ልዩነት።",
      },
      van: {
        title: "የመኪና መጠን ትንተና",
        subtitle: "በብዛት ልዩነት እና በአንድ እቃ ዋጋ መሰረት በመኪና ውስጥ ያለውን የአሁን ገንዘብ ለማስላት የተጫነ እና የቀረ ዳቦ ያስገቡ።",
        loadedProduct: "የተጫነ ምርት (ዳቦ)",
        leftBread: "የቀረ ዳቦ",
        delivered: "የተሰራጨ",
        currentCashInVan: "በመኪና ውስጥ ያለ የአሁን ገንዘብ",
        realMoneyInHand: "በእጅ ያለ እውነተኛ ገንዘብ (አሁን)",
        emptyPlaceholder: "0",
      },
      analysis: {
        noBulk: "እስካሁን የቡድን ባች አልተገኘም። የመኪና ገንዘብና ብዛት ክትትል ለመጀመር ከአዲስ ትዕዛዝ ገፅ የቡድን ትዕዛዝ ይፍጠሩ።",
        enterQuantities: "በመኪና ውስጥ ያለውን የአሁን ገንዘብ ለመከታተል የተጫነ እና የቀረ ዳቦ ያስገቡ።",
        invalidLeft: "የቀረ ዳቦ ከተጫነው ዳቦ መብለጥ አይችልም። ያስገቡትን ዋጋዎች ያረጋግጡ።",
        normal: "ሁሉም ትዕዛዞች እንደ ተሰራጩ ይቆጠራሉ። የተሰበሰበ ገንዘብ በ PAID የተደረጉ ደንበኞች ላይ ይመረጣል።",
      },
      emptyState: "በአሁኑ ክልልዎ ውስጥ የቡድን ትዕዛዞች አልተገኙም።",
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getDashboardCopy(locale: Locale) {
  return dashboardCopy[locale];
}

export const roleCopy = {
  en: {
    SYSTEM_ADMIN: {
      title: "System Admin Dashboard",
      description: "Manage platform-wide settings, bakeries, and privileged accounts.",
      accent: "from-violet-500 to-indigo-600",
      actions: [
        { label: "New order", href: "/orders/new" },
        { label: "Manage customers", href: "/customers" },
        { label: "Review orders", href: "/orders" },
        { label: "Add products", href: "/products" },
      ],
    },
    ADMIN: {
      title: "Admin Dashboard",
      description: "Oversee the bakery, manage staff workflows, and monitor activity.",
      accent: "from-emerald-500 to-teal-500",
      actions: [
        { label: "New order", href: "/orders/new" },
        { label: "Manage customers", href: "/customers" },
        { label: "Review orders", href: "/orders" },
        { label: "Add products", href: "/products" },
      ],
    },
    OWNER: {
      title: "Owner Dashboard",
      description: "Track the full bakery business with a quick view of operations.",
      accent: "from-sky-500 to-cyan-500",
      actions: [
        { label: "New order", href: "/orders/new" },
        { label: "Manage inventory", href: "/products" },
        { label: "View customers", href: "/customers" },
      ],
    },
    STAFF: {
      title: "Staff Dashboard",
      description: "Handle daily order processing and customer support tasks.",
      accent: "from-amber-500 to-orange-500",
      actions: [
        { label: "New order", href: "/orders/new" },
        { label: "Open orders", href: "/orders" },
        { label: "Customers", href: "/customers" },
      ],
    },
    VIEWER: {
      title: "Viewer Dashboard",
      description: "Read-only access to bakery activity and operational summaries.",
      accent: "from-zinc-500 to-zinc-700",
      actions: [
        { label: "Browse orders", href: "/orders" },
        { label: "Browse products", href: "/products" },
        { label: "Customers", href: "/customers" },
      ],
    },
  },
  am: {
    SYSTEM_ADMIN: {
      title: "የስርዓት አስተዳዳሪ ዳሽቦርድ",
      description: "የመድረኩን ቅንብሮች፣ ቤኬሪዎችን እና የተፈቀዱ መለያዎችን ያስተዳድሩ።",
      accent: "from-violet-500 to-indigo-600",
      actions: [
        { label: "አዲስ ትዕዛዝ", href: "/orders/new" },
        { label: "ደንበኞችን ያስተዳድሩ", href: "/customers" },
        { label: "ትዕዛዞችን ይመልከቱ", href: "/orders" },
        { label: "ምርቶችን ያክሉ", href: "/products" },
      ],
    },
    ADMIN: {
      title: "የአስተዳዳሪ ዳሽቦርድ",
      description: "ቤኬሪውን ይቆጣጠሩ፣ የሰራተኞች ስራዎችን ያስተዳድሩ እና እንቅስቃሴን ይከታተሉ።",
      accent: "from-emerald-500 to-teal-500",
      actions: [
        { label: "አዲስ ትዕዛዝ", href: "/orders/new" },
        { label: "ደንበኞችን ያስተዳድሩ", href: "/customers" },
        { label: "ትዕዛዞችን ይመልከቱ", href: "/orders" },
        { label: "ምርቶችን ያክሉ", href: "/products" },
      ],
    },
    OWNER: {
      title: "የባለቤት ዳሽቦርድ",
      description: "የቤኬሪ አጠቃላይ ስራዎችን በፍጥነት ይከታተሉ።",
      accent: "from-sky-500 to-cyan-500",
      actions: [
        { label: "አዲስ ትዕዛዝ", href: "/orders/new" },
        { label: "እቃ ዝርዝርን ያስተዳድሩ", href: "/products" },
        { label: "ደንበኞችን ይመልከቱ", href: "/customers" },
      ],
    },
    STAFF: {
      title: "የሰራተኞች ዳሽቦርድ",
      description: "የዕለቱን ትዕዛዞች እና የደንበኛ እገዛ ስራዎችን ያስተዳድሩ።",
      accent: "from-amber-500 to-orange-500",
      actions: [
        { label: "አዲስ ትዕዛዝ", href: "/orders/new" },
        { label: "ክፍት ትዕዛዞች", href: "/orders" },
        { label: "ደንበኞች", href: "/customers" },
      ],
    },
    VIEWER: {
      title: "የመመልከቻ ዳሽቦርድ",
      description: "የቤኬሪ እንቅስቃሴ እና የአጠቃላይ ሪፖርቶችን ብቻ ይመልከቱ።",
      accent: "from-zinc-500 to-zinc-700",
      actions: [
        { label: "ትዕዛዞችን ይመልከቱ", href: "/orders" },
        { label: "ምርቶችን ይመልከቱ", href: "/products" },
        { label: "ደንበኞች", href: "/customers" },
      ],
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getRoleCopy(locale: Locale) {
  return roleCopy[locale];
}
