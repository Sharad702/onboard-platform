import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Invoice from "@/models/Invoice";
import OrganizationMember from "@/models/OrganizationMember";
import User from "@/models/User";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft, Eye, ListChecks, IndianRupee } from "lucide-react";
import AssignedToSelect from "./AssignedToSelect";
import DeleteClientButton from "./DeleteClientButton";
import DeleteInvoiceButton from "./DeleteInvoiceButton";
import DeleteProjectButton from "@/app/dashboard/clients/[id]/projects/[projectId]/DeleteProjectButton";
import ExportProjectsButton from "./ExportProjectsButton";
import MarkOnboardingCompleteButton from "./MarkOnboardingCompleteButton";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const client = await Client.findById(id).lean();
  if (!client) notFound();

  const can = await canAccessClient(session.user.id, client);
  if (!can) notFound();

  let canReassign = false;
  let workspaceMembers: { user_id: string; label: string }[] = [];
  let currentUserRole: string | null = null;
  if (client.orgId) {
    const mem = await OrganizationMember.findOne({ orgId: client.orgId, userId: session.user.id }).select("role").lean();
    currentUserRole = mem?.role ?? null;
    canReassign = mem?.role === "owner" || mem?.role === "admin";
    if (canReassign) {
      const orgMems = await OrganizationMember.find({ orgId: client.orgId }).select("userId role").lean();
      const userIds = orgMems.map((m) => m.userId);
      const users = await User.find({ _id: { $in: userIds } }).select("_id fullName email").lean();
      const userMap: Record<string, string> = {};
      users.forEach((u) => {
        userMap[u._id.toString()] = u.fullName || u.email || "—";
      });
      const roleSuffix = (r: string) => (r === "admin" ? " (Admin)" : "");
      workspaceMembers = orgMems
        .filter((m) => m.role !== "owner")
        .map((m) => ({
          user_id: m.userId.toString(),
          label: (userMap[m.userId.toString()] ?? "—") + roleSuffix(m.role),
        }));
    }
  }

  const projects = await Project.find({ clientId: id })
    .select("_id name status valueInr startDate")
    .sort({ createdAt: -1 })
    .lean();

  const projectIds = projects?.map((p) => p._id) ?? [];
  const invoices = await Invoice.find({
    $or: [{ clientId: id }, ...(projectIds.length ? [{ projectId: { $in: projectIds } }] : [])],
  })
    .select("_id clientId projectId description amountInr status dueDate createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const projectNames: Record<string, string> = {};
  projects?.forEach((p) => {
    projectNames[p._id.toString()] = p.name;
  });

  const clientIdStr = client._id.toString();
  const orgIdStr = client.orgId?.toString();
  const isOnboarded = !!(client as { onboardedAt?: Date | null }).onboardedAt;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={orgIdStr ? `/dashboard?workspace=${orgIdStr}` : "/dashboard"}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-[var(--fg-muted)] transition hover:bg-[var(--bg-card)] hover:text-[var(--fg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to clients
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {canReassign && (
            <AssignedToSelect
              clientId={clientIdStr}
              currentAssignedTo={client.assignedTo?.toString() ?? null}
              members={workspaceMembers}
              inline
            />
          )}
          {currentUserRole !== "member" && (
            <span
              className="cursor-not-allowed inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--fg-dim)] opacity-60"
              title="Coming soon"
            >
              Send portal link
            </span>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 animate-fade-up">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h1 className="text-xl font-semibold text-[var(--fg)]">{client.name}</h1>
          <p className="text-[var(--fg-muted)]">{client.email}</p>
          {client.company && <p className="mt-1 text-sm text-[var(--fg-dim)]">{client.company}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!isOnboarded && <MarkOnboardingCompleteButton clientId={clientIdStr} />}
            {isOnboarded && !(projects?.length) && (
              <Link
                href={`/dashboard/clients/${clientIdStr}/projects/new`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--bg-card)] hover:border-[var(--accent)]/30 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
              >
                Create project
              </Link>
            )}
            {currentUserRole !== "member" && (
              <>
                <Link
                  href={`/dashboard/clients/${clientIdStr}/edit`}
                  className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/30"
                >
                  Edit client
                </Link>
                <DeleteClientButton clientId={clientIdStr} clientName={client.name} />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h2 className="font-semibold text-[var(--fg)] mb-2">When you need</h2>
            <p className="text-sm text-[var(--fg-dim)] mb-2">
              {currentUserRole === "member" ? "Doubts? Ask the AI." : "Proposal — use when ready. Doubts? Ask the AI."}
            </p>
            <div className="flex flex-col gap-1">
              {currentUserRole !== "member" && (
                <Link href={`/dashboard/clients/${clientIdStr}/proposal`} className="text-sm text-[var(--accent)] hover:underline">Proposal</Link>
              )}
              <Link href={`/dashboard/clients/${clientIdStr}/ai-chat`} className="text-sm text-[var(--accent)] hover:underline">Ask AI</Link>
            </div>
          </div>
        </div>
      </div>

      <section id="projects" className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition hover:border-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--fg)]">
              <ListChecks className="h-5 w-5 text-[var(--accent)]" />
              Projects
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {isOnboarded && (projects?.length ?? 0) > 0 && (
                <ExportProjectsButton clientId={clientIdStr} />
              )}
              {isOnboarded && (
                <Link
                  href={`/dashboard/clients/${clientIdStr}/projects/new`}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition"
                >
                  Create project
                </Link>
              )}
            </div>
          </div>
          {!isOnboarded ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/50 p-5 text-center">
              <p className="text-sm text-[var(--fg-muted)]">Mark client as onboarded to add projects.</p>
              <div className="mt-3">
                <MarkOnboardingCompleteButton clientId={clientIdStr} />
              </div>
            </div>
          ) : !projects?.length ? (
            <>
              <p className="text-sm text-[var(--fg-dim)]">No projects yet.</p>
              <Link
                href={`/dashboard/clients/${clientIdStr}/projects/new`}
                className="mt-4 inline-flex items-center gap-1 rounded-lg text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Create project
              </Link>
            </>
          ) : (
            <>
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li
                    key={p._id.toString()}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3 transition hover:border-[var(--border)] hover:bg-[var(--bg-elevated)]"
                  >
                    <Link
                      href={`/dashboard/clients/${clientIdStr}/projects/${p._id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="font-medium text-[var(--fg)]">{p.name}</p>
                      <p className="text-sm text-[var(--fg-dim)]">
                        {p.status.replace("_", " ")} · {p.valueInr != null ? `₹${Number(p.valueInr).toLocaleString("en-IN")}` : "—"}
                      </p>
                    </Link>
                    <div className="shrink-0">
                      <DeleteProjectButton
                        projectId={p._id.toString()}
                        projectName={p.name}
                        clientId={clientIdStr}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              {/* <Link
                href={`/dashboard/clients/${clientIdStr}/projects/new`}
                className="mt-4 inline-flex items-center gap-1 rounded-lg text-sm font-medium text-[var(--accent)] hover:underline"
              >
                + New project
              </Link> */}
            </>
          )}
        </section>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="flex items-center gap-2 font-semibold text-[var(--fg)]">
            <IndianRupee className="h-5 w-5 text-[var(--accent)]" />
            Invoices
          </h2>
          <Link
            href={`/dashboard/clients/${clientIdStr}/invoice`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition"
          >
            Create invoice
          </Link>
        </div>
        {!invoices?.length ? (
          <p className="text-sm text-[var(--fg-dim)]">No invoices yet.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv._id.toString()} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
                <div>
                  <p className="font-medium text-[var(--fg)]">
                    {inv.description ?? (inv.projectId ? projectNames[inv.projectId.toString()] : null) ?? "Invoice"}
                  </p>
                  <p className="text-sm text-[var(--fg-dim)]">
                    ₹{Number(inv.amountInr).toLocaleString("en-IN")} · {inv.status === "paid" ? "Paid" : "Pending"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-[var(--fg-dim)]">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "—"}
                  </span>
                  <Link
                    href={`/dashboard/clients/${clientIdStr}/invoices/${inv._id}`}
                    title="View / Download"
                    className="rounded p-1.5 text-[var(--fg-dim)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {currentUserRole !== "member" && (
                    <DeleteInvoiceButton
                      invoiceId={inv._id.toString()}
                      description={inv.description ?? (inv.projectId ? projectNames[inv.projectId.toString()] : null) ?? "Invoice"}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
