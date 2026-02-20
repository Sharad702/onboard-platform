import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import { processTeamBotUpdate, type TelegramUpdate } from "@/lib/telegram-team-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  if (!orgId) return NextResponse.json({ error: "Missing orgId" }, { status: 400 });

  const secret = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  let body: TelegramUpdate;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await connectDB();
  const orgIdObj = new mongoose.Types.ObjectId(orgId);
  const org = await Organization.findById(orgIdObj).select("telegramBotToken telegramWebhookSecret").lean();
  if (!org?.telegramBotToken) return NextResponse.json({ error: "Bot not configured" }, { status: 200 });
  if (org.telegramWebhookSecret && org.telegramWebhookSecret !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await processTeamBotUpdate(orgId, body);
  return NextResponse.json({ ok: true });
}
