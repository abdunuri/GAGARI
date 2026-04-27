import type { Locale } from "@/lib/locales";

export const productsPageCopy = {
  en: {
    title: "New Product",
    subtitle: "Add product details to your catalog.",
    fields: {
      productName: "Product Name",
      category: "Category",
      price: "Price",
      selectCategory: "Select a category",
      bread: "Bread",
      fastFood: "Fast Food",
      cake: "Cake",
    },
    actions: {
      create: "Create Product",
      creating: "Creating...",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      edit: "Edit Product",
      editSubtitle: "Update name, category, and price together.",
      deleteConfirm: "Delete product \"{name}\"?",
    },
    list: {
      title: "Products",
      subtitle: "View and manage products.",
      columns: {
        product: "Product",
        category: "Category",
        price: "Price",
        actions: "Actions",
      },
    },
    messages: {
      fetchFailed: "Failed to fetch products",
      loadFailed: "Failed to load products",
      emptyName: "Product name cannot be empty.",
      invalidCategory: "Category must be BREAD, FASTF, or CAKE.",
      invalidPrice: "Price must be a positive number.",
      updateFailed: "Failed to update product",
      updateSuccess: "Product updated successfully",
      deleteFailed: "Failed to delete product",
      deleteSuccess: "Product deleted successfully",
      createFailed: "Failed to create Product",
      createSuccess: "Product created successfully",
      generic: "Something went wrong",
    },
  },
  am: {
    title: "አዲስ ምርት",
    subtitle: "የምርት ዝርዝሮችን ወደ ካታሎግዎ ያክሉ።",
    fields: {
      productName: "የምርት ስም",
      category: "ምድብ",
      price: "ዋጋ",
      selectCategory: "ምድብ ይምረጡ",
      bread: "ዳቦ",
      fastFood: "ፈጣን ምግብ",
      cake: "ኬክ",
    },
    actions: {
      create: "ምርት ፍጠር",
      creating: "በመፍጠር ላይ...",
      cancel: "ሰርዝ",
      saveChanges: "ለውጦችን አስቀምጥ",
      edit: "ምርትን አርትዕ",
      editSubtitle: "ስም፣ ምድብ እና ዋጋ በአንድ ያዘምኑ።",
      deleteConfirm: "ምርት \"{name}\" ይሰረዝ?",
    },
    list: {
      title: "ምርቶች",
      subtitle: "ምርቶችን ይመልከቱ እና ያስተዳድሩ።",
      columns: {
        product: "ምርት",
        category: "ምድብ",
        price: "ዋጋ",
        actions: "እርምጃዎች",
      },
    },
    messages: {
      fetchFailed: "ምርቶችን ማምጣት አልተሳካም",
      loadFailed: "ምርቶችን መጫን አልተሳካም",
      emptyName: "የምርት ስም ባዶ መሆን አይችልም።",
      invalidCategory: "ምድብ BREAD፣ FASTF ወይም CAKE መሆን አለበት።",
      invalidPrice: "ዋጋ አዎንታዊ ቁጥር መሆን አለበት።",
      updateFailed: "ምርትን ማዘመን አልተሳካም",
      updateSuccess: "ምርቱ በተሳካ ሁኔታ ተዘምኗል",
      deleteFailed: "ምርትን መሰረዝ አልተሳካም",
      deleteSuccess: "ምርቱ በተሳካ ሁኔታ ተሰርዟል",
      createFailed: "ምርት መፍጠር አልተሳካም",
      createSuccess: "ምርት በተሳካ ሁኔታ ተፈጥሯል",
      generic: "ስህተት ተፈጥሯል",
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getProductsPageCopy(locale: Locale) {
  return productsPageCopy[locale];
}
