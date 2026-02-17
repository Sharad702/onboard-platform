"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

export default function EditDueDate({
  invoiceId,
  currentDueDate,
}: {
  invoiceId: string;
  currentDueDate: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    currentDueDate ? new Date(currentDueDate).toISOString().slice(0, 10) : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: value || null }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <div className="print:hidden flex items-center gap-2">
      {editing ? (
        <>
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="text-sm text-[var(--accent)] hover:underline disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setValue(currentDueDate ? new Date(currentDueDate).toISOString().slice(0, 10) : ""); }}
            className="text-sm text-zinc-500 hover:text-zinc-400"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-400">
            Due: {currentDueDate
              ? new Date(currentDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "Not set"}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Change
          </button>
        </>
      )}
    </div>
  );
}
