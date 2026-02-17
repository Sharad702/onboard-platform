import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";

async function canAccessProject(userId: string, projectId: string) {
  const project = await Project.findById(projectId).populate("clientId");
  if (!project?.clientId) return false;
  const client = project.clientId as { ownerId: unknown; orgId?: unknown; assignedTo?: unknown };
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
  const can = await canAccessProject(session.user.id, id);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.status !== undefined) {
    if (project.status !== body.status) {
      project.status = body.status;
      project.statusChangedAt = new Date();
    }
  }
  if (body.checklist !== undefined) project.checklist = body.checklist;
  await project.save();
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
  const can = await canAccessProject(session.user.id, id);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Milestone.deleteMany({ projectId: id });
  await Invoice.deleteMany({ projectId: id });
  await Project.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
