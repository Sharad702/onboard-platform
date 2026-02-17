import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import OrganizationMember from "@/models/OrganizationMember";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await connectDB();
  const org = await Organization.create({ name: name.trim(), createdBy: session.user.id });
  await OrganizationMember.create({ orgId: org._id, userId: session.user.id, role: "owner" });
  return NextResponse.json({ id: org._id.toString() });
}
