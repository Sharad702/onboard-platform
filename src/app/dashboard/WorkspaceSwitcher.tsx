"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Org = { id: string; name: string };

export default function WorkspaceSwitcher({
  orgs,
  currentWorkspaceId,
  canUsePersonal = true,
}: {
  orgs: Org[];
  currentWorkspaceId: string | null;
  canUsePersonal?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const COOKIE_NAME = "dashboard_workspace";
  const value = currentWorkspaceId ?? (canUsePersonal ? "personal" : orgs[0]?.id ?? "personal");

  function switchTo(orgId: string | null) {
    if (orgId) {
      document.cookie = `${COOKIE_NAME}=${orgId}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
    }
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (orgId) params.set("workspace", orgId);
    else params.delete("workspace");
    const q = params.toString();
    router.push(pathname + (q ? `?${q}` : ""));
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--fg-dim)]">Workspace</span>
      <select
        value={value}
        onChange={(e) => switchTo(e.target.value === "personal" ? null : e.target.value)}
        className="min-w-[8rem] rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
      >
        {canUsePersonal && <option value="personal">Personal</option>}
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}
