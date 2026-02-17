"use client";

import Link from "next/link";

const COOKIE_NAME = "dashboard_workspace";

function getWorkspaceFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function DashboardLogoLink() {
  const workspaceId = getWorkspaceFromCookie();
  const href = workspaceId ? `/dashboard?workspace=${workspaceId}` : "/dashboard";

  return (
    <Link
      href={href}
      className="text-[15px] font-semibold text-[var(--fg)] tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] rounded"
    >
      OnboardEasy
    </Link>
  );
}
