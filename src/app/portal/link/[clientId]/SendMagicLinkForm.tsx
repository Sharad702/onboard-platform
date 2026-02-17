"use client";

import { useState } from "react";

export default function SendMagicLinkForm({
  clientId,
  clientEmail,
  clientName,
}: {
  clientId: string;
  clientEmail: string;
  clientName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/portal/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to create link");
      return;
    }
    setSent(true);
    setLink(data.link ?? null);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
        <p className="font-medium text-emerald-400">Link created.</p>
        <p className="mt-2 text-sm text-zinc-400">
          Share this link with {clientName} (email integration coming soon):
        </p>
        {link && (
          <p className="mt-3 break-all rounded-xl bg-zinc-800 p-3 text-sm text-zinc-200 font-mono">
            {link}
          </p>
        )}
        <button
          type="button"
          onClick={() => { setSent(false); setLink(null); }}
          className="mt-4 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition"
        >
          Create another link
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg">
      <p className="text-sm text-zinc-400 mb-4">
        We’ll create a one-time link and (when email is set up) send it to{" "}
        <strong className="text-zinc-200">{clientEmail}</strong>.
      </p>
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="btn-press rounded-xl bg-brand-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-brand-500/20 hover:bg-brand-400 disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create & send magic link"}
      </button>
      {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
