"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateInvoiceForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const desc = description.trim();
    if (!desc) {
      setError("Description is required.");
      return;
    }
    if (!amount || Number(amount) < 1) {
      setError("Enter a valid amount.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        description: desc,
        amountInr: Number(amount),
        dueDate: dueDate || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create invoice.");
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
        <span className="text-sm font-medium text-zinc-400">Description *</span>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-dark mt-1"
          placeholder="e.g. Website design - Advance payment"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-400">Amount (₹) *</span>
        <input
          type="number"
          min={1}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-dark mt-1"
          placeholder="50000"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-400">Due date</span>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input-dark mt-1"
        />
      </label>
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-press rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create invoice"}
        </button>
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="rounded-xl border border-zinc-600 px-5 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 transition"
        >
          Cancel
        </Link>
      </div>
      <p className="text-xs text-zinc-500">
        Invoice is saved as draft. You can view or print it from the client page.
      </p>
    </form>
  );
}
