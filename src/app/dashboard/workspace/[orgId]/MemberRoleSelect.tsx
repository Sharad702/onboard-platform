"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MemberRoleSelect({
  orgId,
  memberUserId,
  currentRole,
}: {
  orgId: string;
  memberUserId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(currentRole);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as "admin" | "member";
    if (newRole === currentRole) return;
    setLoading(true);
    const res = await fetch(`/api/workspace/${orgId}/members/${memberUserId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setLoading(false);
    if (res.ok) {
      setValue(newRole);
      router.refresh();
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={loading}
      className="shrink-0 w-fit min-w-[5.25rem] rounded-md border border-[var(--border)] bg-[var(--bg-card)] py-1 px-2 text-xs capitalize text-[var(--fg)] focus:border-[var(--accent)] focus:outline-none disabled:opacity-50"
      aria-label="Change role"
    >
      <option value="admin">Admin</option>
      <option value="member">Member</option>
    </select>
  );
}
