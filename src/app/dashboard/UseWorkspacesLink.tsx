"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

export default function UseWorkspacesLink() {
  const router = useRouter();

  function enableWorkspaces() {
    document.cookie = "loginMode=workspace; path=/; max-age=2592000; SameSite=Lax";
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={enableWorkspaces}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--fg)]"
    >
      <Building2 className="h-4 w-4" />
      Use workspaces
    </button>
  );
}
