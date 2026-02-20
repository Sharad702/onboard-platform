"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams?.get("workspace") ?? null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    telegramUsername: "",
    gstin: "",
    address: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        workspaceId: workspaceId || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to add client.");
      return;
    }
    router.push(workspaceId ? `/dashboard?workspace=${workspaceId}` : "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link
        href={workspaceId ? `/dashboard?workspace=${workspaceId}` : "/dashboard"}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-6">Add client</h1>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Name *</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-dark mt-1 w-full"
              placeholder="Client name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Email *</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-dark mt-1 w-full"
              placeholder="client@company.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Company</span>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="input-dark mt-1 w-full"
              placeholder="Company name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input-dark mt-1 w-full"
              placeholder="+91 98765 43210"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Telegram</span>
            <input
              type="text"
              value={form.telegramUsername}
              onChange={(e) => setForm((f) => ({ ...f, telegramUsername: e.target.value }))}
              className="input-dark mt-1 w-full"
              placeholder="username or @username"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">GSTIN</span>
            <input
              type="text"
              value={form.gstin}
              onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
              className="input-dark mt-1 w-full"
              placeholder="22AAAAA0000A1Z5"
            />
          </label>
          <div className="hidden md:block" aria-hidden />
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Address</span>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              rows={2}
              className="input-dark mt-1 w-full"
              placeholder="Billing address"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="input-dark mt-1 w-full"
              placeholder="Internal notes"
            />
          </label>
        </div>
        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-press rounded-xl bg-brand-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save client"}
          </button>
          <Link
            href={workspaceId ? `/dashboard?workspace=${workspaceId}` : "/dashboard"}
            className="rounded-xl border border-zinc-600 px-5 py-2.5 font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
