import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import ClientPortalToken from "@/models/ClientPortalToken";
import Client from "@/models/Client";
import Organization from "@/models/Organization";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import Invoice from "@/models/Invoice";
import ClientPortalView from "./ClientPortalView";

export default async function PortalViewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/portal/invalid");

  await connectDB();
  const row = await ClientPortalToken.findOne({ token }).select("clientId expiresAt usedAt").lean();
  if (!row) redirect("/portal/invalid");
  if (new Date(row.expiresAt) < new Date()) redirect("/portal/expired");
  if (row.usedAt) redirect("/portal/invalid");

  const client = await Client.findById(row.clientId).select("_id name email orgId").lean();
  if (!client) redirect("/portal/invalid");

  let branding: { logoUrl: string | null; primaryColor: string } = { logoUrl: null, primaryColor: "#0d9488" };
  if (client.orgId) {
    const org = await Organization.findById(client.orgId).select("logoUrl primaryColor").lean();
    if (org) {
      branding = {
        logoUrl: (org as { logoUrl?: string | null }).logoUrl ?? null,
        primaryColor: (org as { primaryColor?: string }).primaryColor ?? "#0d9488",
      };
    }
  }

  const projects = await Project.find({ clientId: client._id })
    .select("_id name status valueInr contractSignedAt")
    .sort({ createdAt: -1 })
    .lean();

  const projectIds = projects?.map((p) => p._id) ?? [];
  const milestones = projectIds.length
    ? await Milestone.find({ projectId: { $in: projectIds } })
        .select("_id projectId title completedAt")
        .sort({ orderIndex: 1 })
        .lean()
    : [];
  const invoices = await Invoice.find({
    $or: [
      ...(projectIds.length ? [{ projectId: { $in: projectIds } }] : []),
      { clientId: client._id },
    ],
    status: { $in: ["pending", "draft", "sent"] },
  }).lean();

  return (
    <ClientPortalView
      clientId={client._id.toString()}
      clientName={client.name}
      token={token}
      logoUrl={branding.logoUrl}
      primaryColor={branding.primaryColor}
      projects={projects?.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        status: p.status,
        value_inr: p.valueInr,
        contract_signed_at: p.contractSignedAt,
      })) ?? []}
      milestones={milestones?.map((m) => ({
        id: m._id.toString(),
        project_id: m.projectId.toString(),
        title: m.title,
        completed_at: m.completedAt,
      })) ?? []}
      invoices={invoices?.map((i) => ({
        id: i._id.toString(),
        project_id: i.projectId?.toString() ?? "",
        amount_inr: i.amountInr,
        status: i.status,
      })) ?? []}
    />
  );
}
