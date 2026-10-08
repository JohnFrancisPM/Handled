"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Sign-out control (security-plan.md §4): POSTs to /api/auth/logout to end the
 * session server-side, then sends the user to /login. Only rendered in live mode
 * (demo mode has no session to end), so no demo-mode guard is needed here.
 */
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors — still send the user to the login screen.
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={signOut}
      disabled={busy}
      aria-label="Sign out"
    >
      <LogOut aria-hidden="true" size={16} />
      <span className="hidden sm:inline">{busy ? "Signing out…" : "Sign out"}</span>
    </Button>
  );
}
