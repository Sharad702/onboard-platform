"use client";

import { useRouter } from "next/navigation";

type Member = { user_id: string; label: string };

export default function AssignedToSelect({
  clientId,
  currentAssignedTo,
  members,
  inline,
}: {
  clientId: string;
  currentAssignedTo: string | null;
  members: Member[];
  inline?: boolean;
}) {
  const router = useRouter();

  async function changeAssignedTo(userId: string | null) {
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: userId || null }),
    });
    router.refresh();
  }

  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[var(--fg-dim)] whitespace-nowrap">Assigned to</label>
        <select
          value={currentAssignedTo ?? ""}
          onChange={(e) => changeAssignedTo(e.target.value || null)}
          className="input-dark min-w-[8rem] py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>{m.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
      <label className="text-xs text-[var(--fg-dim)]">Assigned to</label>
      <select
        value={currentAssignedTo ?? ""}
        onChange={(e) => changeAssignedTo(e.target.value || null)}
        className="input-dark mt-1 max-w-xs"
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.user_id} value={m.user_id}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
