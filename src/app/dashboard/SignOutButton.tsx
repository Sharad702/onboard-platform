"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      title="Sign out"
      className="rounded-lg p-2 text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
    >
      <LogOut className="h-4 w-4" aria-hidden />
    </button>
  );
}
