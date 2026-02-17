import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import OrganizationMember from "@/models/OrganizationMember";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId, userId } = await params;
  if (!orgId || !userId) return NextResponse.json({ error: "orgId and userId required" }, { status: 400 });

  await connectDB();

  const currentMembership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role").lean();
  if (!currentMembership) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  if (currentMembership.role !== "owner") return NextResponse.json({ error: "Only the owner can change member roles" }, { status: 403 });

  const targetMember = await OrganizationMember.findOne({ orgId, userId }).select("role").lean();
  if (!targetMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (targetMember.role === "owner") return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 });

  const body = await request.json();
  const role = typeof body.role === "string" ? body.role.toLowerCase() : "";
  if (!["admin", "member"].includes(role)) return NextResponse.json({ error: "Role must be admin or member" }, { status: 400 });

  await OrganizationMember.findOneAndUpdate(
    { orgId, userId },
    { $set: { role } }
  );
  return NextResponse.json({ ok: true });
}
