import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { clientId, name, valueInr, startDate } = body;
  if (!clientId || !name) return NextResponse.json({ error: "clientId and name required" }, { status: 400 });

  await connectDB();
  const client = await Client.findById(clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!client.onboardedAt) return NextResponse.json({ error: "Complete client onboarding first" }, { status: 400 });

  const project = await Project.create({
    clientId,
    name: name.trim(),
    valueInr: valueInr != null ? Number(valueInr) : undefined,
    startDate: startDate || undefined,
    receivedVia: "manual",
  });
  return NextResponse.json({ id: project._id.toString() });
}
