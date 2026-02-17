"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteWorkspaceButton({
  orgId,
  workspaceName,
}: {
  orgId: string;
  workspaceName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete workspace "${workspaceName}"? Members will be removed and workspace clients will become your personal clients. This can't be undone.`
      )
    )
      return;
    setLoading(true);
    const res = await fetch(`/api/workspace/${orgId}`, { method: "DELETE" });
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
      className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/50 hover:text-red-300 disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete workspace"}
    </button>
  );
}
