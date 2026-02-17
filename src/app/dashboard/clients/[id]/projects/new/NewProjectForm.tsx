"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    value_inr: "",
    start_date: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        name: form.name,
        valueInr: form.value_inr ? Number(form.value_inr) : null,
        startDate: form.start_date || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create project.");
      return;
    }
    router.push(`/dashboard/clients/${clientId}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg space-y-4"
    >
      <label className="block">
        <span className="text-sm font-medium text-zinc-400">Project name *</span>
        <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="e.g. Website redesign" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-400">Value (₹)</span>
        <input type="number" min={0} step={1} value={form.value_inr} onChange={(e) => setForm((f) => ({ ...f, value_inr: e.target.value }))} className="input-dark" placeholder="50000" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-400">Start date</span>
        <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className="input-dark" />
      </label>
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-press rounded-xl bg-brand-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-brand-500/20 hover:bg-brand-400 disabled:opacity-50">
          {loading ? "Creating…" : "Create project"}
        </button>
        <Link href={`/dashboard/clients/${clientId}`} className="rounded-xl border border-zinc-600 px-5 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}
