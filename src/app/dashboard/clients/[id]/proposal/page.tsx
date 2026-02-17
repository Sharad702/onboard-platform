import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import OrganizationMember from "@/models/OrganizationMember";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft } from "lucide-react";
import ProposalGenerator from "./ProposalGenerator";

export default async function ProposalPage({
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

  if (client.orgId) {
    const mem = await OrganizationMember.findOne({ orgId: client.orgId, userId: session.user.id }).select("role").lean();
    if (mem?.role === "member") notFound();
  }

  const projects = await Project.find({ clientId: id }).select("_id name valueInr").sort({ createdAt: -1 }).lean();

  const projectsData = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    value_inr: p.valueInr ?? null,
  }));

  return (
    <div className="max-w-2xl animate-fade-in">
      <Link
        href={`/dashboard/clients/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {client.name}
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Generate proposal</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Fill in the brief below. A proposal draft will be generated (copy and edit as needed). AI integration can replace this with a full PDF later.
      </p>
      <ProposalGenerator clientName={client.name} clientCompany={client.company ?? ""} projects={projectsData} />
    </div>
  );
}
