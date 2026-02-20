"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function TelegramBotForm({
  orgId,
  botUsername,
  tokenKey,
}: {
  orgId: string;
  botUsername: string | null;
  tokenKey: "telegramBotToken" | "telegramClientBotToken";
}) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const res = await fetch(`/api/workspace/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [tokenKey]: token.trim() || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save");
      return;
    }
    setSuccess(true);
    setToken("");
    setError(null);
    setTimeout(() => window.location.reload(), 600);
  }

  async function handleDisconnect() {
    if (!confirm("Remove this bot? Re-add the token later to reconnect.")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/workspace/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [tokenKey]: "" }),
    });
    setLoading(false);
    if (res.ok) window.location.reload();
    else {
      const data = await res.json();
      setError(data.error || "Failed to disconnect");
    }
  }

  if (botUsername) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--fg-dim)]">
          Bot connected: <strong className="text-[var(--fg)]">@{botUsername}</strong>
        </p>
        <p className="text-xs text-[var(--fg-dim)]">
          {tokenKey === "telegramClientBotToken"
            ? "Send each client their link from the client page. They open → Start → send tasks."
            : "Send the Connect Telegram link (below) to team members. They open → Start → get notifications."}
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={loading}
          className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          {loading ? "Removing…" : "Remove bot"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <p className="text-sm text-[var(--fg-dim)]">
        Create a bot with <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">@BotFather</a> on Telegram, then paste the token below. The bot will be used for this workspace only.
      </p>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Bot token (e.g. 7123456789:AAH...)"
        className="input-dark w-full"
        autoComplete="off"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">Bot saved.</p>}
      {!success && (
        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? "Saving…" : "Connect bot"}
        </button>
      )}
    </form>
  );
}
