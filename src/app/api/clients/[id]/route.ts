import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import Invoice from "@/models/Invoice";
import ClientPortalToken from "@/models/ClientPortalToken";
import OrganizationMember from "@/models/OrganizationMember";
import { canAccessClient } from "@/lib/auth-helpers";

async function canEditOrDeleteClient(userId: string, client: { orgId?: unknown }) {
  if (!client.orgId) return true;
  const mem = await OrganizationMember.findOne({ orgId: client.orgId, userId }).select("role").lean();
  return mem && (mem.role === "owner" || mem.role === "admin");
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const client = await Client.findById(id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await canEditOrDeleteClient(session.user.id, client))) return NextResponse.json({ error: "Only owner or admin can delete client" }, { status: 403 });

  const projectIds = (await Project.find({ clientId: id }).select("_id").lean()).map((p) => p._id);
  await Milestone.deleteMany({ projectId: { $in: projectIds } });
  await Invoice.deleteMany({ $or: [{ projectId: { $in: projectIds } }, { clientId: id }] });
  await Project.deleteMany({ clientId: id });
  await ClientPortalToken.deleteMany({ clientId: id });
  await Client.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const client = await Client.findById(id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await canEditOrDeleteClient(session.user.id, client))) return NextResponse.json({ error: "Only owner or admin can edit client" }, { status: 403 });

  const body = await request.json();
  const allowed = ["name", "email", "company", "phone", "gstin", "address", "notes", "assignedTo", "onboardedAt"];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "assignedTo") {
        client.assignedTo = body[key] === "" || body[key] == null ? undefined : body[key];
      } else if (key === "onboardedAt") {
        client.onboardedAt = body[key] ? new Date() : undefined;
      } else {
        (client as Record<string, unknown>)[key] = body[key] === "" ? null : body[key];
      }
    }
  }
  await client.save();
  return NextResponse.json({ ok: true });
}
