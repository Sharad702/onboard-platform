"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function GetTelegramLinkButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setUrl(null);
    const res = await fetch(`/api/clients/${clientId}/telegram-link`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to get link");
      return;
    }
    setUrl(data.url);
  }

  async function copyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] hover:bg-[var(--bg-card)] disabled:opacity-50"
      >
        <MessageCircle className="h-4 w-4" />
        {loading ? "Getting link…" : "Get Telegram link"}
      </button>
      {error && <span className="text-sm text-red-400">{error}</span>}
      {url && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={url}
            className="input-dark max-w-[280px] text-xs"
          />
          <button
            type="button"
            onClick={copyUrl}
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm text-white hover:opacity-90"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
