import type { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import Project from "@/models/Project";
import OrganizationMember from "@/models/OrganizationMember";
import { canAccessClient } from "@/lib/auth-helpers";

async function canAccessInvoice(userId: string, invoiceId: string) {
  await connectDB();
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) return false;
  if (invoice.clientId) {
    const client = await Client.findById(invoice.clientId).lean();
    return client ? canAccessClient(userId, client) : false;
  }
  if (invoice.projectId) {
    const project = await Project.findById(invoice.projectId).populate("clientId").lean();
    const client = project?.clientId;
    return client
      ? canAccessClient(userId, client as { ownerId: Types.ObjectId; orgId?: Types.ObjectId | null; assignedTo?: Types.ObjectId | null })
      : false;
  }
  return false;
}

async function canEditOrDeleteInvoice(userId: string, invoiceId: string): Promise<boolean> {
  await connectDB();
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) return false;
  let client: { orgId?: unknown } | null = null;
  if (invoice.clientId) client = await Client.findById(invoice.clientId).select("orgId").lean();
  else if (invoice.projectId) {
    const project = await Project.findById(invoice.projectId).populate("clientId").lean();
    client = project?.clientId as { orgId?: unknown } | null ?? null;
  }
  if (!client) return false;
  if (!client.orgId) return true;
  const mem = await OrganizationMember.findOne({ orgId: client.orgId, userId }).select("role").lean();
  return mem != null && mem.role !== "member";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const canAccess = await canAccessInvoice(session.user.id, id);
  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const canEdit = await canEditOrDeleteInvoice(session.user.id, id);
  if (!canEdit) return NextResponse.json({ error: "Only owner or admin can edit invoice or mark as paid" }, { status: 403 });

  const body = await request.json();
  const invoice = await Invoice.findById(id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.status !== undefined) {
    const s = String(body.status).toLowerCase();
    if (["pending", "paid", "cancelled"].includes(s)) {
      invoice.status = s;
      if (s === "paid") invoice.paidAt = new Date();
      if (s !== "paid") invoice.paidAt = undefined;
    }
  }
  if (body.dueDate !== undefined) {
    invoice.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
  }
  await invoice.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const canAccess = await canAccessInvoice(session.user.id, id);
  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const canDelete = await canEditOrDeleteInvoice(session.user.id, id);
  if (!canDelete) return NextResponse.json({ error: "Only owner or admin can delete invoice" }, { status: 403 });

  const deleted = await Invoice.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
