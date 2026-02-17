import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import ClientPortalToken from "@/models/ClientPortalToken";
import { canAccessClient } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await request.json();
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  await connectDB();
  const client = await Client.findById(clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await ClientPortalToken.create({
    clientId,
    token,
    expiresAt,
  });

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${base}/portal/view?token=${token}`;
  return NextResponse.json({ link });
}
