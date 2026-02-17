"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const COOKIE_NAME = "dashboard_workspace";

function getWorkspaceFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function BackToDashboardLink({ workspaceId }: { workspaceId?: string | null }) {
  const fromCookie = workspaceId ?? getWorkspaceFromCookie();
  const href = fromCookie ? `/dashboard?workspace=${fromCookie}` : "/dashboard";

  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to dashboard
    </Link>
  );
}
