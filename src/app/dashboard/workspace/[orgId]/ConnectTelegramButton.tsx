"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function ConnectTelegramButton({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setUrl(null);
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
    setUrl(data.url);
    if (data.url) window.open(data.url, "_blank");
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--fg)] hover:bg-[var(--bg-card)] disabled:opacity-50"
      >
        <MessageCircle className="h-4 w-4" />
        {loading ? "Getting link…" : "Connect Telegram for notifications"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {url && (
        <p className="text-xs text-[var(--fg-dim)]">
          Link opens in a new tab. If it didn’t, <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">open it here</a>. Link expires in 15 minutes.
        </p>
      )}
    </div>
  );
}
