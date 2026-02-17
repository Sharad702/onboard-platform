"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Circle, Trash2 } from "lucide-react";

export default function MilestoneItem({
  id,
  title,
  due_date,
  completed_at,
  amount_inr,
}: {
  id: string;
  title: string;
  due_date: string | null;
  completed_at: string | null;
  amount_inr: number | null;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function toggleComplete() {
    await fetch(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed_at: !completed_at }),
    });
    router.refresh();
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete milestone "${title}"?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.refresh();
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 p-3 transition hover:bg-zinc-800/50">
      <button
        type="button"
        onClick={toggleComplete}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        {completed_at ? (
          <Check className="h-5 w-5 shrink-0 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 shrink-0 text-zinc-500" />
        )}
        <span className={completed_at ? "text-zinc-500 line-through" : "text-zinc-200"}>
          {title}
        </span>
      </button>
      <span className="text-sm text-zinc-500 shrink-0">
        {due_date ? new Date(due_date).toLocaleDateString("en-IN") : "—"}
        {amount_inr != null ? ` · ₹${Number(amount_inr).toLocaleString("en-IN")}` : ""}
      </span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 rounded p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-50"
        title="Delete milestone"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
