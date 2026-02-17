import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import OrganizationMember from "@/models/OrganizationMember";
import User from "@/models/User";
import { ArrowLeft } from "lucide-react";
import DeleteWorkspaceButton from "./DeleteWorkspaceButton";
import InviteForm from "./InviteForm";
import MemberRoleSelect from "./MemberRoleSelect";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const org = await Organization.findById(orgId).lean();
  if (!org) notFound();

  const membership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role").lean();
  if (!membership) notFound();

  const members = await OrganizationMember.find({ orgId }).select("userId role").lean();
  const userIds = members.map((m) => m.userId);
  const users = await User.find({ _id: { $in: userIds } }).select("_id fullName email").lean();
  const userMap: Record<string, string> = {};
  users.forEach((u) => {
    const id = String(u._id);
    userMap[id] = (u.fullName && u.fullName.trim()) || u.email || "—";
  });

  return (
    <div className="max-w-xl animate-fade-in">
      <Link href={`/dashboard?workspace=${orgId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <h1 className="text-xl font-semibold text-[var(--fg)]">{org.name}</h1>
      <p className="text-[var(--fg-dim)] text-sm mt-1">Workspace settings</p>

      {["owner", "admin"].includes(membership.role) && (
        <>
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="font-semibold text-[var(--fg)] mb-2">Invite member</h2>
            <p className="text-sm text-[var(--fg-dim)] mb-4">Send the invite link to their email. They sign in and join this workspace.</p>
            <InviteForm orgId={orgId} />
          </div>
        </>
      )}

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="font-semibold text-[var(--fg)] mb-4">Members</h2>
        <ul className="space-y-2">
          {members.map((m) => {
            const uid = String(m.userId);
            const displayName = userMap[uid] ?? "—";
            return (
            <li key={uid} className="flex justify-between items-center gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-[var(--fg)] flex-1 min-w-[8rem] truncate" title={displayName}>{displayName}</span>
              {membership.role === "owner" && m.role !== "owner" ? (
                <MemberRoleSelect
                  orgId={orgId}
                  memberUserId={m.userId.toString()}
                  currentRole={m.role}
                />
              ) : (
                <span className="text-xs text-[var(--fg-dim)] capitalize shrink-0">{m.role}</span>
              )}
            </li>
            );
          })}
        </ul>
      </div>

      {membership.role === "owner" && (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="font-semibold text-[var(--fg)] mb-2">Danger zone</h2>
          <p className="text-sm text-[var(--fg-dim)] mb-4">
            Deleting this workspace removes all members and invites. Clients in this workspace will become your personal clients.
          </p>
          <DeleteWorkspaceButton orgId={orgId} workspaceName={org.name} />
        </div>
      )}
    </div>
  );
}
