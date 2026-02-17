"use client";

import { useRouter } from "next/navigation";

const STATUSES = ["active", "on_hold", "completed", "cancelled"] as const;

export default function ProjectStatusSelect({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  async function changeStatus(status: string) {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-sm text-[var(--fg-dim)] shrink-0">Status:</span>
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => changeStatus(s)}
          className={`shrink-0 rounded-lg px-3 py-1 text-sm capitalize ${
            currentStatus === s
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:bg-[var(--bg-card)]"
          }`}
        >
          {s.replace("_", " ")}
        </button>
      ))}
    </div>
  );
}
