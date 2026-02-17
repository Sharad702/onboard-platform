"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteProjectButton({
  projectId,
  projectName,
  clientId,
}: {
  projectId: string;
  projectName: string;
  clientId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete project "${projectName}"? Milestones and invoices under it will be removed. This can't be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Delete project"
      className="rounded p-1.5 text-[var(--fg-dim)] hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
