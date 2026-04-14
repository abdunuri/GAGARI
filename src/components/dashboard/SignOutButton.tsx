"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <button type="button" onClick={handleSignOut} className="ml-2 underline">
      signOut
    </button>
  );
}
