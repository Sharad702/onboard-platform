"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkAsPaidButton({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isPaid = currentStatus === "paid";

  async function handleMarkPaid() {
    setLoading(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  if (isPaid) return null;

  return (
    <button
      type="button"
      onClick={handleMarkPaid}
      disabled={loading}
      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
    >
      {loading ? "Updating…" : "Mark as paid"}
    </button>
  );
}
