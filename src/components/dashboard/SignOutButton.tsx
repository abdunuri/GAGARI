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
    <button type="button" onClick={handleSignOut} className="ml-2 underline">
      signOut
    </button>
  );
}
