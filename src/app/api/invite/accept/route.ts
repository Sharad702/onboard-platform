import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import OrganizationInvite from "@/models/OrganizationInvite";
import OrganizationMember from "@/models/OrganizationMember";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  await connectDB();
  const invite = await OrganizationInvite.findOne({ token }).select("orgId expiresAt");
  if (!invite || new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
  }

  try {
    await OrganizationMember.create({
      orgId: invite.orgId,
      userId: session.user.id,
      role: "member",
    });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === 11000) {
      return NextResponse.json({ already: true, orgId: invite.orgId.toString() });
    }
    throw e;
  }

  await OrganizationInvite.deleteOne({ _id: invite._id });
  return NextResponse.json({ orgId: invite.orgId.toString() });
}
