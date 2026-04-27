import type { Locale } from "@/lib/locales";

export const adminDashboardCopy = {
  en: {
    heroTag: "Platform Overview",
    heroTitle: "System Administration",
    heroDescription: "Global metrics and tenant visibility for bakeries, orders, owners, and account growth.",
    stats: [
      { key: "bakeries", label: "Total Bakeries", hint: "All registered bakery tenants" },
      { key: "orders", label: "Total Orders", hint: "Orders across all bakeries" },
      { key: "pendingOrders", label: "Pending Orders", hint: "Orders waiting for completion" },
      { key: "products", label: "Total Products", hint: "Platform-wide product records" },
      { key: "customers", label: "Total Customers", hint: "Customer records in all bakeries" },
      { key: "owners", label: "Total Owners", hint: "Users with OWNER role" },
    ],
    bakeries: {
      title: "Bakeries List",
      subtitle: "Recent bakeries with owner and activity counts.",
      empty: "No bakeries found.",
      ownerPrefix: "Owner",
      unassigned: "Unassigned",
      noEmail: "No email",
      orders: "Orders",
      customers: "Customers",
      products: "Products",
    },
    owners: {
      title: "Owners List",
      subtitle: "Recent owner accounts and their assigned bakery.",
      empty: "No owners found.",
      noEmail: "No email",
      noBakery: "No bakery",
      joined: "Joined",
    },
  },
  am: {
    heroTag: "የፕላትፎርም አጠቃላይ እይታ",
    heroTitle: "የስርዓት አስተዳደር",
    heroDescription: "ለቤኬሪዎች፣ ትዕዛዞች፣ ባለቤቶች እና የመለያ እድገት አጠቃላይ መለኪያዎች።",
    stats: [
      { key: "bakeries", label: "ጠቅላላ ቤኬሪዎች", hint: "የተመዘገቡ ሁሉም ቤኬሪዎች" },
      { key: "orders", label: "ጠቅላላ ትዕዛዞች", hint: "በሁሉም ቤኬሪዎች ያሉ ትዕዛዞች" },
      { key: "pendingOrders", label: "በመጠባበቅ ያሉ ትዕዛዞች", hint: "ማጠናቀቅ የሚጠብቁ ትዕዛዞች" },
      { key: "products", label: "ጠቅላላ ምርቶች", hint: "በፕላትፎርሙ ላይ ያሉ የምርት መዝገቦች" },
      { key: "customers", label: "ጠቅላላ ደንበኞች", hint: "በሁሉም ቤኬሪዎች ያሉ የደንበኛ መዝገቦች" },
      { key: "owners", label: "ጠቅላላ ባለቤቶች", hint: "OWNER ሚና ያላቸው ተጠቃሚዎች" },
    ],
    bakeries: {
      title: "የቤኬሪዎች ዝርዝር",
      subtitle: "የቅርብ ቤኬሪዎች ከባለቤትና እንቅስቃሴ ቁጥሮች ጋር።",
      empty: "ምንም ቤኬሪ አልተገኘም።",
      ownerPrefix: "ባለቤት",
      unassigned: "አልተመደበም",
      noEmail: "ኢሜይል የለም",
      orders: "ትዕዛዞች",
      customers: "ደንበኞች",
      products: "ምርቶች",
    },
    owners: {
      title: "የባለቤቶች ዝርዝር",
      subtitle: "የቅርብ የባለቤት መለያዎች እና የተመደበላቸው ቤኬሪ።",
      empty: "ምንም ባለቤት አልተገኘም።",
      noEmail: "ኢሜይል የለም",
      noBakery: "ቤኬሪ የለም",
      joined: "የተቀላቀለው",
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getAdminDashboardCopy(locale: Locale) {
  return adminDashboardCopy[locale];
}

export const adminNewCopy = {
  en: {
    tag: "Create Bakery + Owner",
    title: "New Bakery Account Setup",
    subtitle: "This single form creates the bakery first, creates the owner with that bakery ID, then links the bakery owner.",
    bakerySection: {
      title: "Bakery Details",
      subtitle: "Enter information for the bakery record.",
      bakeryName: "Bakery Name",
      bakeryPlaceholder: "e.g. Sunrise Bakery",
    },
    ownerSection: {
      title: "Owner Account Details",
      subtitle: "These details are used to create the owner user account.",
      fullName: "Full Name",
      fullNamePlaceholder: "e.g. Hana Tesfaye",
      username: "Username",
      usernamePlaceholder: "owner_username",
      email: "Email",
      emailPlaceholder: "owner@bakery.com",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
    },
    createLabel: "Create Bakery and Owner",
    creatingLabel: "Creating...",
    createFailed: "Failed to create bakery and owner.",
    successLine: "Bakery #{id} ({name}) linked to owner {ownerName} ({ownerEmail}).",
  },
  am: {
    tag: "ቤኬሪ + ባለቤት ፍጠር",
    title: "አዲስ የቤኬሪ መለያ ማዋቀር",
    subtitle: "ይህ አንድ ቅጽ መጀመሪያ ቤኬሪውን ይፈጥራል፣ ከዚያ ባለቤቱን ከቤኬሪ መለያ ጋር ይፈጥራል እና ያገናኛል።",
    bakerySection: {
      title: "የቤኬሪ ዝርዝሮች",
      subtitle: "ለቤኬሪ መዝገብ መረጃ ያስገቡ።",
      bakeryName: "የቤኬሪ ስም",
      bakeryPlaceholder: "ለምሳሌ፡ Sunrise Bakery",
    },
    ownerSection: {
      title: "የባለቤት መለያ ዝርዝሮች",
      subtitle: "እነዚህ ዝርዝሮች የባለቤት ተጠቃሚ መለያ ለመፍጠር ይጠቅማሉ።",
      fullName: "ሙሉ ስም",
      fullNamePlaceholder: "ለምሳሌ፡ Hana Tesfaye",
      username: "የተጠቃሚ ስም",
      usernamePlaceholder: "owner_username",
      email: "ኢሜይል",
      emailPlaceholder: "owner@bakery.com",
      password: "የይለፍ ቃል",
      passwordPlaceholder: "ቢያንስ 8 ቁምፊ",
    },
    createLabel: "ቤኬሪ እና ባለቤት ፍጠር",
    creatingLabel: "በመፍጠር ላይ...",
    createFailed: "ቤኬሪ እና ባለቤት መፍጠር አልተሳካም።",
    successLine: "ቤኬሪ #{id} ({name}) ከባለቤት {ownerName} ({ownerEmail}) ጋር ተያይዟል።",
  },
} as const satisfies Record<Locale, unknown>;

export function getAdminNewCopy(locale: Locale) {
  return adminNewCopy[locale];
}
