import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import OrganizationMember from "@/models/OrganizationMember";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { Plus, Users, Settings } from "lucide-react";
import ClientCard from "./ClientCard";
import UseWorkspacesLink from "./UseWorkspacesLink";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SetWorkspaceCookie from "./SetWorkspaceCookie";

const DASHBOARD_WORKSPACE_COOKIE = "dashboard_workspace";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const { workspace: workspaceId } = await searchParams;
  const session = await getSession();
  if (!session?.user?.id) return null;

  const cookieStore = cookies();
  const loginMode = (cookieStore.get("loginMode")?.value ?? "workspace") as "personal" | "workspace";
  const showWorkspaceBar = loginMode === "workspace";
  const effectiveWorkspaceId = showWorkspaceBar ? workspaceId : undefined;

  // Redirect to last workspace when opening /dashboard without ?workspace (cookie is set on client)
  if (!effectiveWorkspaceId && showWorkspaceBar) {
    const saved = cookieStore.get(DASHBOARD_WORKSPACE_COOKIE)?.value;
    if (saved) redirect(`/dashboard?workspace=${saved}`);
  }

  await connectDB();
  const userId = session.user.id;

  const memberships = await OrganizationMember.find({ userId }).select("orgId role").lean();
  const orgIds = memberships.map((m) => m.orgId);
  const hasOwnerAdmin = memberships.some((m) => m.role === "owner" || m.role === "admin");
  const isInvitedOnly = orgIds.length > 0 && !hasOwnerAdmin;

  const orgList =
    orgIds.length > 0
      ? (await Organization.find({ _id: { $in: orgIds } }).select("_id name").lean()).map((o) => ({
          id: o._id.toString(),
          name: o.name,
        }))
      : [];

  if (isInvitedOnly && !effectiveWorkspaceId && orgList.length > 0) {
    redirect(`/dashboard?workspace=${orgList[0].id}`);
  }

  let membership: { role: string } | null = null;
  if (effectiveWorkspaceId) {
    const m = memberships.find((x) => x.orgId.toString() === effectiveWorkspaceId);
    membership = m ? { role: m.role } : null;
  }

  const clientFilter = effectiveWorkspaceId
    ? membership && ["owner", "admin"].includes(membership.role)
      ? { orgId: effectiveWorkspaceId }
      : { orgId: effectiveWorkspaceId, assignedTo: userId }
    : { ownerId: userId, orgId: null };

  const clients = await Client.find(clientFilter)
    .select("_id name email company createdAt assignedTo")
    .sort({ createdAt: -1 })
    .lean();

  const assignedIds = Array.from(
    new Set(
      (clients as { assignedTo?: { toString: () => string } | null }[])
        .map((c) => c.assignedTo?.toString())
        .filter(Boolean)
    )
  ) as string[];
  const assigneeList =
    assignedIds.length > 0
      ? await User.find({ _id: { $in: assignedIds } }).select("_id fullName email").lean()
      : [];
  const assigneeMap: Record<string, string> = {};
  assigneeList.forEach((p) => {
    assigneeMap[p._id.toString()] = p.fullName || p.email || "—";
  });

  const canAddClient =
    !effectiveWorkspaceId ||
    (membership && ["owner", "admin"].includes(membership.role));
  const addClientHref = effectiveWorkspaceId ? `/dashboard/clients/new?workspace=${effectiveWorkspaceId}` : "/dashboard/clients/new";

  const clientsSubtitle =
    !effectiveWorkspaceId || !membership
      ? "Manage and onboard your clients"
      : membership.role === "owner"
        ? "Manage and onboard your clients"
        : membership.role === "admin"
          ? "Manage and onboard workspace clients"
          : "Clients assigned to you";

  return (
    <div>
      <SetWorkspaceCookie workspaceId={effectiveWorkspaceId ?? null} />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">Clients</h1>
          <p className="mt-0.5 text-sm text-[var(--fg-dim)]">{clientsSubtitle}</p>
        </div>
        {canAddClient && (
          <Link
            href={addClientHref}
            className="btn-press btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg shadow-[var(--accent)]/10 transition hover:shadow-[var(--accent)]/20"
          >
            <Plus className="h-4 w-4" />
            Add client
          </Link>
        )}
      </div>

      {showWorkspaceBar ? (
        <div className="flex flex-wrap items-center gap-2 mb-6 py-2 border-b border-[var(--border-subtle)]">
          <WorkspaceSwitcher
            orgs={orgList}
            currentWorkspaceId={effectiveWorkspaceId ?? null}
            canUsePersonal={!isInvitedOnly}
            canCreateWorkspace={!isInvitedOnly}
          />
          {effectiveWorkspaceId && membership && (
            <span className="rounded-md bg-[var(--bg-card)] px-2 py-1 text-xs font-medium text-[var(--fg-muted)]">
              {["owner", "admin"].includes(membership.role) ? "All clients" : "Assigned to you"}
            </span>
          )}
          {effectiveWorkspaceId && membership && ["owner", "admin"].includes(membership.role) ? (
            <Link
              href={`/dashboard/workspace/${effectiveWorkspaceId}`}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--fg)]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mb-6 py-2 border-b border-[var(--border-subtle)]">
          <UseWorkspacesLink />
        </div>
      )}

      {!clients?.length ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)]/40 py-16 px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/10">
            <Users className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <p className="mt-5 text-lg font-medium text-[var(--fg)]">
            {canAddClient ? "No clients yet" : "No clients assigned to you yet"}
          </p>
          <p className="mt-1 text-sm text-[var(--fg-dim)] max-w-sm mx-auto">
            {canAddClient
              ? "Add your first client, then create a project and send them the portal link."
              : "Ask your workspace admin to assign you clients."}
          </p>
          {canAddClient && (
            <Link
              href={addClientHref}
              className="btn-press btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add your first client
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {clients.map((c, i) => (
            <li key={c._id.toString()} className="animate-fade-up" style={{ animationDelay: `${i * 0.03}s`, animationFillMode: "backwards" }}>
              <ClientCard
                href={`/dashboard/clients/${c._id}`}
                name={c.name}
                subtitle={c.company || c.email}
                assignedLabel={effectiveWorkspaceId && membership && ["owner", "admin"].includes(membership.role) && c.assignedTo ? assigneeMap[c.assignedTo.toString()] ?? undefined : undefined}
                date={new Date(c.createdAt).toLocaleDateString("en-IN")}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
