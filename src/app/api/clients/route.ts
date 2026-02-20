import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import OrganizationMember from "@/models/OrganizationMember";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, email, company, phone, telegramUsername, gstin, address, notes, workspaceId } = body;
  if (!name || !email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  const telegram = typeof telegramUsername === "string" ? telegramUsername.replace(/^@/, "").trim() || undefined : undefined;

  await connectDB();
  const userId = session.user.id;

  if (workspaceId) {
    const mem = await OrganizationMember.findOne({ orgId: workspaceId, userId }).select("role").lean();
    if (!mem) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
    if (mem.role === "member") return NextResponse.json({ error: "Only owner or admin can add clients" }, { status: 403 });
  } else {
    const memberships = await OrganizationMember.find({ userId }).select("role").lean();
    const hasOwnerAdmin = memberships.some((m) => m.role === "owner" || m.role === "admin");
    if (memberships.length > 0 && !hasOwnerAdmin) {
      return NextResponse.json({ error: "Invited members cannot create personal workspace clients" }, { status: 403 });
    }
  }

  const client = await Client.create({
    ownerId: userId,
    orgId: workspaceId || undefined,
    assignedTo: workspaceId ? userId : undefined,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    company: company?.trim() || undefined,
    phone: phone?.trim() || undefined,
    telegramUsername: telegram,
    gstin: gstin?.trim() || undefined,
    address: address?.trim() || undefined,
    notes: notes?.trim() || undefined,
  });

  return NextResponse.json({ id: client._id.toString() });
}
