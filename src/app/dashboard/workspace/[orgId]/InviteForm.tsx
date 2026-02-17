"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLink(null);
    const res = await fetch("/api/workspace/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, email }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    if (data.link) setLink(data.link);
    setEmail("");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleInvite} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-dark flex-1"
          placeholder="teammate@company.com"
        />
        <button type="submit" disabled={loading} className="btn-press btn-primary rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">
          {loading ? "Sending…" : "Get invite link"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {link && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--fg-dim)] mb-1">Share this link (valid 7 days):</p>
          <p className="text-sm text-[var(--fg)] break-all font-mono">{link}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(link)}
            className="mt-2 text-sm text-[var(--accent)] hover:underline"
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
