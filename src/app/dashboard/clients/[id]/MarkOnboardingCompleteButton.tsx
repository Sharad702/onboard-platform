"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkOnboardingCompleteButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMark() {
    setLoading(true);
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardedAt: true }),
    });
    setLoading(false);
    if (!res.ok) return;
    router.push(`/dashboard/clients/${clientId}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleMark}
      disabled={loading}
      className="btn-press rounded-lg border border-[var(--accent)]/50 bg-[var(--accent-muted)] px-4 py-2.5 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:opacity-50"
    >
      {loading ? "Saving…" : "Mark onboarding complete"}
    </button>
  );
}
