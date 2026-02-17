"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function AddMilestoneForm({
  projectId,
  nextIndex,
}: {
  projectId: string;
  nextIndex: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title,
        dueDate: dueDate || null,
        amountInr: amount ? Number(amount) : null,
        orderIndex: nextIndex,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setTitle("");
      setAmount("");
      setDueDate("");
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300"
      >
        <Plus className="h-4 w-4" />
        Add milestone
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
      <input
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-dark"
        placeholder="Milestone title"
      />
      <div className="flex gap-3 flex-wrap">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input-dark flex-1 min-w-0"
        />
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-dark w-32"
          placeholder="₹ Amount"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-press rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white hover:bg-brand-400 disabled:opacity-50">
          {loading ? "Adding…" : "Add"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
