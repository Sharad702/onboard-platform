import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Organization from "@/models/Organization";
import { canAccessClient } from "@/lib/auth-helpers";
import { randomSecret } from "@/lib/telegram";

const LINK_EXPIRY_DAYS = 7;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clientId } = await params;
  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!client.orgId) {
    return NextResponse.json({ error: "Telegram link is only for workspace clients" }, { status: 400 });
  }

  const org = await Organization.findById(client.orgId).select("telegramClientBotUsername").lean();
  if (!org?.telegramClientBotUsername) {
    return NextResponse.json({ error: "No client bot configured. Add a client bot in workspace settings." }, { status: 400 });
  }

  const token = randomSecret();
  const expiresAt = new Date(Date.now() + LINK_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await Client.findByIdAndUpdate(clientId, {
    telegramLinkToken: token,
    telegramLinkTokenExpiresAt: expiresAt,
  });

  const startParam = `client_${clientId}_${token}`;
  const url = `https://t.me/${org.telegramClientBotUsername}?start=${startParam}`;
  return NextResponse.json({ url, expiresInDays: LINK_EXPIRY_DAYS });
}
