import type { Locale } from "@/lib/locales";

export const customersPageCopy = {
  en: {
    title: "New Customer",
    subtitle: "Create a new customer profile.",
    fields: {
      customerName: "Customer Name",
      phoneNumber: "Phone Number",
    },
    actions: {
      create: "Create customer",
      creating: "Creating...",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      edit: "Edit Customer",
      editSubtitle: "Update name and phone number together.",
      deleteConfirm: "Delete customer \"{name}\"?",
    },
    list: {
      title: "Customers",
      subtitle: "View and manage customers.",
      columns: {
        customerName: "Customer Name",
        phoneNumber: "Phone Number",
        actions: "Actions",
      },
    },
    messages: {
      fetchFailed: "Failed to fetch customers",
      loadFailed: "Failed to load customers",
      emptyName: "Customer name cannot be empty.",
      emptyPhone: "Phone number cannot be empty.",
      invalidPhone: "Phone number can include digits, spaces, + and - only.",
      updateFailed: "Failed to update customer",
      updateSuccess: "Customer updated successfully",
      deleteFailed: "Failed to delete customer",
      deleteSuccess: "Customer deleted successfully",
      createFailed: "Failed to create customer",
      createSuccess: "Customer created successfully",
      generic: "Something went wrong",
    },
  },
  am: {
    title: "አዲስ ደንበኛ",
    subtitle: "አዲስ የደንበኛ ፕሮፋይል ይፍጠሩ።",
    fields: {
      customerName: "የደንበኛ ስም",
      phoneNumber: "ስልክ ቁጥር",
    },
    actions: {
      create: "ደንበኛ ፍጠር",
      creating: "በመፍጠር ላይ...",
      cancel: "ሰርዝ",
      saveChanges: "ለውጦችን አስቀምጥ",
      edit: "ደንበኛን አርትዕ",
      editSubtitle: "ስም እና ስልክ ቁጥርን በአንድ ያዘምኑ።",
      deleteConfirm: "ደንበኛ \"{name}\" ይሰረዝ?",
    },
    list: {
      title: "ደንበኞች",
      subtitle: "ደንበኞችን ይመልከቱ እና ያስተዳድሩ።",
      columns: {
        customerName: "የደንበኛ ስም",
        phoneNumber: "ስልክ ቁጥር",
        actions: "እርምጃዎች",
      },
    },
    messages: {
      fetchFailed: "ደንበኞችን ማምጣት አልተሳካም",
      loadFailed: "ደንበኞችን መጫን አልተሳካም",
      emptyName: "የደንበኛ ስም ባዶ መሆን አይችልም።",
      emptyPhone: "ስልክ ቁጥር ባዶ መሆን አይችልም።",
      invalidPhone: "የስልክ ቁጥር ቁጥሮችን፣ ክፍተትን፣ + እና - ብቻ ሊይዝ ይችላል።",
      updateFailed: "ደንበኛን ማዘመን አልተሳካም",
      updateSuccess: "ደንበኛው በተሳካ ሁኔታ ተዘምኗል",
      deleteFailed: "ደንበኛን መሰረዝ አልተሳካም",
      deleteSuccess: "ደንበኛው በተሳካ ሁኔታ ተሰርዟል",
      createFailed: "ደንበኛ መፍጠር አልተሳካም",
      createSuccess: "ደንበኛ በተሳካ ሁኔታ ተፈጥሯል",
      generic: "ስህተት ተፈጥሯል",
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getCustomersPageCopy(locale: Locale) {
  return customersPageCopy[locale];
}
