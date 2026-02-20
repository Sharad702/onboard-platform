import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Organization from "@/models/Organization";
import OrganizationInvite from "@/models/OrganizationInvite";
import OrganizationMember from "@/models/OrganizationMember";
import { getMe, setWebhookWithOrgId, setWebhookForClientBot, deleteWebhook, randomSecret, getBaseUrl } from "@/lib/telegram";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await params;
  if (!orgId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

  await connectDB();

  const membership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role").lean();
  if (!membership) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  if (membership.role !== "owner") return NextResponse.json({ error: "Only the owner can delete the workspace" }, { status: 403 });

  const org = await Organization.findById(orgId);
  if (!org) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  // Move workspace clients to personal (unset orgId)
  await Client.updateMany({ orgId }, { $unset: { orgId: 1 } });
  await OrganizationInvite.deleteMany({ orgId });
  await OrganizationMember.deleteMany({ orgId });
  await Organization.findByIdAndDelete(orgId);

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await params;
  if (!orgId) return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });

  await connectDB();
  const membership = await OrganizationMember.findOne({ orgId, userId: session.user.id }).select("role").lean();
  if (!membership) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  if (!["owner", "admin"].includes(membership.role)) return NextResponse.json({ error: "Only owner or admin can update workspace" }, { status: 403 });

  const org = await Organization.findById(orgId);
  if (!org) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const body = await request.json();
  if (body.name !== undefined && typeof body.name === "string" && body.name.trim()) org.name = body.name.trim();
  if (body.logoUrl !== undefined) org.logoUrl = body.logoUrl === "" ? undefined : body.logoUrl;
  if (body.primaryColor !== undefined && /^#[0-9A-Fa-f]{6}$/.test(body.primaryColor)) org.primaryColor = body.primaryColor;

  if (body.telegramBotToken !== undefined) {
    const raw = typeof body.telegramBotToken === "string" ? body.telegramBotToken.trim() : "";
    if (raw) {
      const me = await getMe(raw);
      if (!me?.username) {
        return NextResponse.json({ error: "Invalid bot token. Create a bot with @BotFather and paste the token." }, { status: 400 });
      }
      const secret = randomSecret();
      org.telegramBotToken = raw;
      org.telegramWebhookSecret = secret;
      org.telegramBotUsername = me.username;

      const baseUrl = getBaseUrl();
      if (!baseUrl) {
        await org.save();
        return NextResponse.json({
          ok: true,
          webhookSet: false,
          message: "Bot saved. Add NEXT_PUBLIC_APP_URL to .env (e.g. https://your-app.vercel.app or ngrok URL for local) and reconnect to enable the bot.",
        });
      }
      const result = await setWebhookWithOrgId(raw, orgId, secret);
      await org.save();
      if (!result.ok) {
        const isLocal = !result.error || /https|localhost/i.test(result.error);
        const message = isLocal
          ? "Bot saved. For local dev run: npm run telegram:poll in a separate terminal."
          : `Bot saved, but webhook could not be set. ${result.error || ""} For local dev run: npm run telegram:poll`;
        return NextResponse.json({ ok: true, webhookSet: false, message });
      }
      return NextResponse.json({ ok: true });
    } else {
      if (org.telegramBotToken) {
        await deleteWebhook(org.telegramBotToken);
      }
      org.telegramBotToken = undefined;
      org.telegramWebhookSecret = undefined;
      org.telegramBotUsername = undefined;
    }
  }

  if (body.projectTemplates !== undefined) {
    const raw = Array.isArray(body.projectTemplates) ? body.projectTemplates : [];
    org.projectTemplates = raw
      .map((t: unknown) => {
        if (!t || typeof t !== "object") return null;
        const o = t as Record<string, unknown>;
        const name = typeof o.name === "string" ? o.name.trim() : "";
        if (!name) return null;
        const checklist = Array.isArray(o.checklist)
          ? o.checklist.map((c) => (typeof c === "string" ? c.trim() : "")).filter(Boolean)
          : [];
        return { name, checklist };
      })
      .filter(Boolean) as { name: string; checklist: string[] }[];
  }

  if (body.telegramClientBotToken !== undefined) {
    const raw = typeof body.telegramClientBotToken === "string" ? body.telegramClientBotToken.trim() : "";
    if (raw) {
      const me = await getMe(raw);
      if (!me?.username) {
        return NextResponse.json({ error: "Invalid client bot token. Create a bot with @BotFather and paste the token." }, { status: 400 });
      }
      const secret = randomSecret();
      org.telegramClientBotToken = raw;
      org.telegramClientWebhookSecret = secret;
      org.telegramClientBotUsername = me.username;

      const baseUrl = getBaseUrl();
      if (!baseUrl) {
        await org.save();
        return NextResponse.json({
          ok: true,
          webhookSet: false,
          message: "Bot saved. Add NEXT_PUBLIC_APP_URL to .env (e.g. https://your-app.vercel.app or ngrok URL for local) and reconnect to enable the bot.",
        });
      }
      const result = await setWebhookForClientBot(raw, orgId, secret);
      await org.save();
      if (!result.ok) {
        const isLocal = !result.error || /https|localhost/i.test(result.error);
        const message = isLocal
          ? "Bot saved. For local dev run: npm run telegram:poll in a separate terminal."
          : `Bot saved, but webhook could not be set. ${result.error || ""} For local dev run: npm run telegram:poll`;
        return NextResponse.json({ ok: true, webhookSet: false, message });
      }
      return NextResponse.json({ ok: true });
    } else {
      if (org.telegramClientBotToken) await deleteWebhook(org.telegramClientBotToken);
      org.telegramClientBotToken = undefined;
      org.telegramClientWebhookSecret = undefined;
      org.telegramClientBotUsername = undefined;
    }
  }

  await org.save();
  return NextResponse.json({ ok: true });
}
