import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Milestone from "@/models/Milestone";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";

async function canAccessMilestone(userId: string, milestoneId: string) {
  const milestone = await Milestone.findById(milestoneId).populate({ path: "projectId", populate: "clientId" });
  if (!milestone?.projectId) return false;
  const proj = milestone.projectId as { clientId: { ownerId: unknown; orgId?: unknown; assignedTo?: unknown } };
  const client = proj.clientId;
  if (!client) return false;
  return canAccessClient(userId, {
    ownerId: client.ownerId as import("mongoose").Types.ObjectId,
    orgId: client.orgId as import("mongoose").Types.ObjectId | null,
    assignedTo: client.assignedTo as import("mongoose").Types.ObjectId | null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const can = await canAccessMilestone(session.user.id, id);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const milestone = await Milestone.findById(id);
  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.completed_at !== undefined) milestone.completedAt = body.completed_at ? new Date() : undefined;
  await milestone.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const can = await canAccessMilestone(session.user.id, id);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const milestone = await Milestone.findByIdAndDelete(id);
  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
