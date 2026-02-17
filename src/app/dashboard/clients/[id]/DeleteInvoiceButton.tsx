"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteInvoiceButton({
  invoiceId,
  description,
}: {
  invoiceId: string;
  description: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete invoice "${description}"? This can't be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Delete invoice"
      className="rounded p-1.5 text-[var(--fg-dim)] hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-50 shrink-0"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
