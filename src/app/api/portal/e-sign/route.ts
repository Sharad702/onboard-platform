import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ClientPortalToken from "@/models/ClientPortalToken";
import Project from "@/models/Project";

export async function POST(request: Request) {
  const { token, projectId } = await request.json();
  if (!token || !projectId) {
    return NextResponse.json({ error: "token and projectId required" }, { status: 400 });
  }

  await connectDB();
  const row = await ClientPortalToken.findOne({ token }).select("clientId expiresAt usedAt").lean();
  if (!row || new Date(row.expiresAt) < new Date() || row.usedAt) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const project = await Project.findOne({
    _id: projectId,
    clientId: row.clientId,
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  project.contractSignedAt = new Date();
  await project.save();

  return NextResponse.json({ ok: true });
}
