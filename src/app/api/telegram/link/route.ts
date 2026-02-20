import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import OrganizationMember from "@/models/OrganizationMember";
import User from "@/models/User";
import { randomSecret } from "@/lib/telegram";

const LINK_EXPIRY_MINUTES = 15;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const orgId = body.orgId as string | undefined;
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  await connectDB();
  const membership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role").lean();
  if (!membership) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });

  const org = await Organization.findById(orgId).select("telegramBotUsername").lean();
  if (!org?.telegramBotUsername) {
    return NextResponse.json({ error: "This workspace has no Telegram bot configured" }, { status: 400 });
  }

  const token = randomSecret();
  const expiresAt = new Date(Date.now() + LINK_EXPIRY_MINUTES * 60 * 1000);
  await User.findByIdAndUpdate(session.user.id, {
    telegramLinkToken: token,
    telegramLinkTokenExpiresAt: expiresAt,
  });

  const startParam = `connect_${token}`;
  const url = `https://t.me/${org.telegramBotUsername}?start=${startParam}`;
  return NextResponse.json({ url, expiresIn: LINK_EXPIRY_MINUTES * 60 });
}
