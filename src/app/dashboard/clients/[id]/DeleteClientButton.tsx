"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${clientName}"? All their projects, milestones and invoices will be removed. This can't be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) return;
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-300 transition disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete client"}
    </button>
  );
}
