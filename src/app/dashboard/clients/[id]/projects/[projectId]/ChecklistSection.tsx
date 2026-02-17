"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus, Check, Circle } from "lucide-react";

type Item = { title: string; done?: boolean };
export default function ChecklistSection({
  projectId,
  checklist,
}: {
  projectId: string;
  checklist: Item[] | null;
}) {
  const router = useRouter();
  const list = Array.isArray(checklist) ? checklist : [];
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  async function saveChecklist(next: Item[]) {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist: next }),
    });
    router.refresh();
  }

  async function toggle(i: number) {
    const next = list.map((item, idx) =>
      idx === i ? { ...item, done: !item.done } : item
    );
    await saveChecklist(next);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await saveChecklist([...list, { title: newTitle.trim(), done: false }]);
    setNewTitle("");
    setAdding(false);
  }

  async function removeItem(i: number) {
    const next = list.filter((_, idx) => idx !== i);
    await saveChecklist(next);
  }

  const done = list.filter((i) => i.done).length;
  const progress = list.length ? Math.round((done / list.length) * 100) : 0;

  return (
    <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
      <h2 className="flex items-center gap-2 font-semibold text-zinc-100 mb-2">
        <ClipboardList className="h-5 w-5 text-brand-400" />
        Checklist
      </h2>
      {list.length > 0 && (
        <div className="mb-3 flex justify-between text-sm text-zinc-500">
          <span>{done}/{list.length} done</span>
          <span>{progress}%</span>
        </div>
      )}
      {list.length > 0 && (
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <ul className="space-y-2">
        {list.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 p-3 hover:bg-zinc-800/50"
          >
            <button type="button" onClick={() => toggle(i)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              {item.done ? (
                <Check className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-zinc-500" />
              )}
              <span className={item.done ? "text-zinc-500 line-through" : "text-zinc-200"}>
                {item.title}
              </span>
            </button>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-zinc-500 hover:text-red-400 text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      ) : (
        <form onSubmit={addItem} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-dark flex-1"
            placeholder="Checklist item"
            autoFocus
          />
          <button type="submit" className="btn-press rounded-lg bg-brand-500 px-3 py-2 text-sm text-white hover:bg-brand-400">
            Add
          </button>
          <button type="button" onClick={() => { setAdding(false); setNewTitle(""); }} className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-400">
            Cancel
          </button>
        </form>
      )}
    </section>
  );
}
