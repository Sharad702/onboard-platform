import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import OrganizationMember from "@/models/OrganizationMember";
import OrganizationInvite from "@/models/OrganizationInvite";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId, email } = await request.json();
  if (!orgId || !email) return NextResponse.json({ error: "orgId and email required" }, { status: 400 });

  await connectDB();
  const membership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role");
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners/admins can invite" }, { status: 403 });
  }

  const token = randomBytes(24).toString("hex");
  await OrganizationInvite.create({
    orgId,
    email: email.toLowerCase().trim(),
    token,
    createdBy: session.user.id,
  });

  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? (request.headers.get("x-forwarded-ssl") === "on" ? "https" : "http");
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (host ? `${protocol}://${host}` : "http://localhost:3000");
  const link = `${base}/invite?token=${token}`;
  return NextResponse.json({ ok: true, link });
}
