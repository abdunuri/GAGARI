"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      // Optionally show a toast or error message to the user
    }
  };
  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 lg:px-3 lg:py-1.5 lg:text-xs"
    >
      Sign out
    </button>
  );
}
