"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Client = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  telegramUsername: string | null;
  gstin: string | null;
  address: string | null;
  notes: string | null;
};

export default function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: client.name,
    email: client.email,
    company: client.company ?? "",
    phone: client.phone ?? "",
    telegramUsername: client.telegramUsername ?? "",
    gstin: client.gstin ?? "",
    address: client.address ?? "",
    notes: client.notes ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        company: form.company || null,
        phone: form.phone || null,
        telegramUsername: form.telegramUsername || null,
        gstin: form.gstin || null,
        address: form.address || null,
        notes: form.notes || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save.");
      return;
    }
    router.push(`/dashboard/clients/${client.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-[var(--fg-dim)]">Name *</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-dark mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--fg-dim)]">Email *</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-dark mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--fg-dim)]">Company</span>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            className="input-dark mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--fg-dim)]">Phone</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input-dark mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--fg-dim)]">Telegram</span>
          <input
            type="text"
            value={form.telegramUsername}
            onChange={(e) => setForm((f) => ({ ...f, telegramUsername: e.target.value }))}
            className="input-dark mt-1 w-full"
            placeholder="username or @username"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--fg-dim)]">GSTIN</span>
          <input
            type="text"
            value={form.gstin}
            onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
            className="input-dark mt-1 w-full"
          />
        </label>
        <div className="hidden md:block" aria-hidden />
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-[var(--fg-dim)]">Address</span>
          <textarea
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            rows={2}
            className="input-dark mt-1 w-full"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-[var(--fg-dim)]">Notes</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="input-dark mt-1 w-full"
          />
        </label>
      </div>
      {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-press rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="rounded-xl border border-[var(--border)] px-5 py-2.5 font-medium text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] transition"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
