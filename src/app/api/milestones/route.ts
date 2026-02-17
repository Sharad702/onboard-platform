import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Milestone from "@/models/Milestone";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { projectId, title, dueDate, amountInr, orderIndex } = body;
  if (!projectId || !title) return NextResponse.json({ error: "projectId and title required" }, { status: 400 });

  await connectDB();
  const project = await Project.findById(projectId).populate("clientId");
  if (!project?.clientId) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const client = project.clientId as { ownerId: unknown; orgId?: unknown; assignedTo?: unknown };
  const can = await canAccessClient(session.user.id, {
    ownerId: client.ownerId as import("mongoose").Types.ObjectId,
    orgId: client.orgId as import("mongoose").Types.ObjectId | null,
    assignedTo: client.assignedTo as import("mongoose").Types.ObjectId | null,
  });
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const milestone = await Milestone.create({
    projectId,
    title: title.trim(),
    dueDate: dueDate || undefined,
    amountInr: amountInr != null ? Number(amountInr) : undefined,
    orderIndex: orderIndex != null ? Number(orderIndex) : 0,
  });
  return NextResponse.json({ id: milestone._id.toString() });
}
