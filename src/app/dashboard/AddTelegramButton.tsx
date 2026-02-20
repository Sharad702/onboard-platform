"use client";

import { useState } from "react";
import { MessageCircle, Check } from "lucide-react";

export default function AddTelegramButton({
  orgId,
  linked,
}: {
  orgId: string;
  linked: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/telegram/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to get link");
      return;
    }
    if (data.url) window.open(data.url, "_blank");
  }

  if (linked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1.5 text-sm text-[var(--fg-muted)]">
        <Check className="h-4 w-4 text-emerald-500" />
        Telegram added
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1.5 text-sm text-[var(--fg)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/30 disabled:opacity-50"
      >
        <MessageCircle className="h-4 w-4" />
        {loading ? "Getting link…" : "Add Telegram"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
