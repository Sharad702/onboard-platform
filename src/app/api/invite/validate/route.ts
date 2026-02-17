import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import OrganizationInvite from "@/models/OrganizationInvite";
import Organization from "@/models/Organization";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  await connectDB();
  const invite = await OrganizationInvite.findOne({ token, expiresAt: { $gt: new Date() } })
    .select("orgId")
    .lean();
  if (!invite) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });

  const org = await Organization.findById(invite.orgId).select("name").lean();
  if (!org) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  return NextResponse.json({
    orgId: invite.orgId.toString(),
    workspaceName: org.name,
  });
}
