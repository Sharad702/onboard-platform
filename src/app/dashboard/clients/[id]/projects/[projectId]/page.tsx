import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft, ListChecks, ClipboardList } from "lucide-react";
import MilestoneItem from "./MilestoneItem";
import AddMilestoneForm from "./AddMilestoneForm";
import ChecklistSection from "./ChecklistSection";
import ProjectStatusSelect from "./ProjectStatusSelect";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const client = await Client.findById(id).lean();
  if (!client) notFound();

  const can = await canAccessClient(session.user.id, client);
  if (!can) notFound();

  const project = await Project.findOne({ _id: projectId, clientId: id }).lean();
  if (!project) notFound();

  const milestones = await Milestone.find({ projectId })
    .sort({ orderIndex: 1 })
    .lean();

  const statusProgress: Record<string, number> = {
    completed: 100,
    active: 50,
    on_hold: 25,
    cancelled: 0,
  };
  const progress = statusProgress[project.status] ?? 50;
  const receivedVia = (project as { receivedVia?: string | null }).receivedVia;

  const clientIdStr = client._id.toString();
  const projectIdStr = project._id.toString();

  return (
    <div>
      <Link href={`/dashboard/clients/${clientIdStr}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition">
        <ArrowLeft className="h-4 w-4" />
        Back to {client.name}
      </Link>

      <div className="mb-6 animate-slide-up rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-2xl font-semibold text-zinc-100 truncate">{project.name}</h1>
            {receivedVia && (
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${receivedVia === "telegram" ? "bg-sky-500/20 text-sky-300" : "bg-zinc-600/50 text-zinc-400"}`}>
                {receivedVia === "telegram" ? "Telegram" : "Manual"}
              </span>
            )}
          </div>
          {project.valueInr != null && (
            <p className="text-lg font-medium text-zinc-100 shrink-0">
              {(project.currency === "USD" ? "$" : "₹")}{Number(project.valueInr).toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-nowrap items-center gap-3 overflow-x-auto">
          <ProjectStatusSelect projectId={projectIdStr} currentStatus={project.status} />
        </div>
        {(project.statusChangedAt || project.updatedAt) && (
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            {project.statusChangedAt
              ? `Status changed on ${new Date(project.statusChangedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
              : `Last updated on ${new Date(project.updatedAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        )}
        {project.description && (
          <div className="mt-3 rounded-lg border border-zinc-700/60 bg-zinc-800/50 p-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">What client sent</p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{project.description}</p>
          </div>
        )}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-zinc-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-zinc-100 mb-4">
          <ListChecks className="h-5 w-5 text-[var(--accent)]" />
          Milestones
        </h2>
        {!milestones?.length ? (
          <p className="text-sm text-zinc-500">No milestones yet.</p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((m) => (
              <MilestoneItem
                key={m._id.toString()}
                id={m._id.toString()}
                title={m.title}
                due_date={m.dueDate ? new Date(m.dueDate).toISOString().slice(0, 10) : null}
                completed_at={m.completedAt ? new Date(m.completedAt).toISOString() : null}
                amount_inr={m.amountInr ?? null}
              />
            ))}
          </ul>
        )}
        <AddMilestoneForm projectId={projectIdStr} nextIndex={milestones?.length ?? 0} />
      </section>

      <ChecklistSection projectId={projectIdStr} checklist={(project.checklist as { title: string; done?: boolean }[]) || []} />
    </div>
  );
}
