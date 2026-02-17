import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { clientId, description, amountInr, dueDate } = body;
  if (!clientId || amountInr == null) return NextResponse.json({ error: "clientId and amountInr required" }, { status: 400 });
  const desc = typeof description === "string" ? description.trim() : "";
  if (!desc) return NextResponse.json({ error: "Description is required" }, { status: 400 });

  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invoice = await Invoice.create({
    clientId,
    description: desc,
    amountInr: Number(amountInr),
    dueDate: dueDate || undefined,
    status: "pending",
  });
  return NextResponse.json({ id: invoice._id.toString() });
}
