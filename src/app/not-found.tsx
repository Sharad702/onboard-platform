"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NOT_FOUND_REFRESH_KEY = "not_found_refresh";

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const was404 = sessionStorage.getItem(NOT_FOUND_REFRESH_KEY);
    if (was404) {
      sessionStorage.removeItem(NOT_FOUND_REFRESH_KEY);
      router.replace("/dashboard");
      return;
    }
    sessionStorage.setItem(NOT_FOUND_REFRESH_KEY, "1");
    setMounted(true);
  }, [router]);

  // Avoid flash of 404 before redirect on refresh
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse text-[var(--fg-muted)]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[var(--bg)] px-4">
      <h1 className="text-6xl font-bold text-[var(--fg-muted)]">404</h1>
      <p className="text-[var(--fg-muted)]">This page could not be found.</p>
      <Link
        href="/dashboard"
        onClick={() => sessionStorage.removeItem(NOT_FOUND_REFRESH_KEY)}
        className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:opacity-90 transition"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
