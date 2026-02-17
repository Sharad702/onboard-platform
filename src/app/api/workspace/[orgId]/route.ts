import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Organization from "@/models/Organization";
import OrganizationInvite from "@/models/OrganizationInvite";
import OrganizationMember from "@/models/OrganizationMember";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await params;
  if (!orgId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

  await connectDB();

  const membership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role").lean();
  if (!membership) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  if (membership.role !== "owner") return NextResponse.json({ error: "Only the owner can delete the workspace" }, { status: 403 });

  const org = await Organization.findById(orgId);
  if (!org) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  // Move workspace clients to personal (unset orgId)
  await Client.updateMany({ orgId }, { $unset: { orgId: 1 } });
  await OrganizationInvite.deleteMany({ orgId });
  await OrganizationMember.deleteMany({ orgId });
  await Organization.findByIdAndDelete(orgId);

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await params;
  if (!orgId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

  await connectDB();
  const membership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role").lean();
  if (!membership) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  if (!["owner", "admin"].includes(membership.role)) return NextResponse.json({ error: "Only owner or admin can update workspace" }, { status: 403 });

  const org = await Organization.findById(orgId);
  if (!org) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const body = await request.json();
  if (body.name !== undefined && typeof body.name === "string" && body.name.trim()) org.name = body.name.trim();
  if (body.logoUrl !== undefined) org.logoUrl = body.logoUrl === "" ? undefined : body.logoUrl;
  if (body.primaryColor !== undefined && /^#[0-9A-Fa-f]{6}$/.test(body.primaryColor)) org.primaryColor = body.primaryColor;
  await org.save();
  return NextResponse.json({ ok: true });
}
