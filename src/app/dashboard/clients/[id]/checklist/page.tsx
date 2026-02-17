import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft, ListChecks, FileSignature } from "lucide-react";

export default async function ChecklistPage({
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

  const projects = await Project.find({ clientId: id }).select("_id name").sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-xl animate-fade-in">
      <Link
        href={`/dashboard/clients/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {client.name}
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Checklist + contract</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Per-project checklist and e-sign are available on each project and in the client portal.
      </p>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <ListChecks className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-zinc-200">Project checklist</p>
            <p className="text-sm text-zinc-500">
              Add and tick off onboarding items (NDA, brief, kickoff) on each project page.
            </p>
            {projects?.length ? (
              <ul className="mt-2 space-y-1">
                {projects.map((p) => (
                  <li key={p._id.toString()}>
                    <Link href={`/dashboard/clients/${id}/projects/${p._id}`} className="text-sm text-brand-400 hover:text-brand-300">
                      {p.name} →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Link href={`/dashboard/clients/${id}/projects/new`} className="mt-2 inline-block text-sm text-brand-400 hover:text-brand-300">
                 Create a project first
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3 pt-4 border-t border-zinc-800">
          <FileSignature className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-zinc-200">Contract (e-sign)</p>
            <p className="text-sm text-zinc-500">
              Send the client portal link. They can e-sign the contract per project from the portal.
            </p>
            <Link href={`/portal/link/${id}`} className="mt-2 inline-block text-sm text-brand-400 hover:text-brand-300">
              Get client portal link →
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        Custom contract text (GST, milestones) can be added in a future update. For now, use your own doc and track signing in the portal.
      </p>
    </div>
  );
}
