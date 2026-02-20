import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import Client from "@/models/Client";
import User from "@/models/User";
import Project from "@/models/Project";
import { sendMessage } from "@/lib/telegram";
import { parseProjectMessageWithGroq } from "@/lib/ai/groq";

export type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Parse price from text. Supports 20000, 20k, $20k, ₹20k, USD 500, etc. Returns amount + currency (INR/USD). */
function parsePrice(text: string): { value: number; currency: "INR" | "USD" } | null {
  if (!text || typeof text !== "string") return null;
  const raw = text.replace(/,/g, "").trim();
  const lower = raw.toLowerCase();

  const usdMatch = lower.match(/\$\s*(\d+(?:\.\d+)?)\s*(k|m)?\b|(?:usd|dollars?)\s*[:\s]*(\d+(?:\.\d+)?)\s*(k|m)?\b/i)
    ?? raw.match(/\$\s*(\d+(?:\.\d+)?)\s*(k|m)?/i);
  if (usdMatch) {
    const num = usdMatch[1] ?? usdMatch[3];
    const suffix = (usdMatch[2] ?? usdMatch[4] ?? "").toLowerCase();
    const n = parseFloat(num);
    if (Number.isNaN(n)) return null;
    const value = suffix === "k" ? n * 1000 : suffix === "m" ? n * 1_000_000 : n;
    if (value > 0) return { value: Math.round(value), currency: "USD" };
  }

  const inrMatch = lower.match(/₹\s*(\d+(?:\.\d+)?)\s*(k|lakh|lac|m)?\b|(?:inr|rs\.?|rupees?)\s*[:\s]*(\d+(?:\.\d+)?)\s*(k|lakh|lac|m)?\b/i)
    ?? lower.match(/(\d+(?:\.\d+)?)\s*(k|lakh|lac)(?:\.|$|\s)/)
    ?? lower.match(/(?:price|amount|budget)\s*[:\s]*(\d+(?:\.\d+)?)\s*(k|lakh|lac)?\b/i)
    ?? lower.match(/(\d+)\s*k\b/)
    ?? lower.match(/(\d{4,})(?:\s|$|\.)/);
  if (inrMatch) {
    const num = inrMatch[1] ?? inrMatch[3];
    const suffix = (inrMatch[2] ?? inrMatch[4] ?? "").toLowerCase();
    const n = parseFloat(num);
    if (Number.isNaN(n)) return null;
    let value = n;
    if (suffix === "k") value = n * 1000;
    else if (suffix === "lakh" || suffix === "lac") value = n * 100_000;
    else if (suffix === "m") value = n * 1_000_000;
    if (value > 0) return { value: Math.round(value), currency: "INR" };
  }

  const plainNum = lower.match(/(\d{4,})(?:\s|$|\.)/);
  if (plainNum) {
    const n = parseInt(plainNum[1], 10);
    if (!Number.isNaN(n) && n > 0) return { value: n, currency: "INR" };
  }
  return null;
}

/** Client bot: per-client link only; no email ask. Used by webhook and poll script. */
export async function processClientBotUpdate(orgId: string, update: TelegramUpdate): Promise<void> {
  const msg = update.message;
  if (!msg?.chat?.id || typeof msg.chat.id !== "number") return;

  await connectDB();
  const orgIdObj = new mongoose.Types.ObjectId(orgId);
  const org = await Organization.findById(orgIdObj).select("telegramClientBotToken").lean();
  if (!org?.telegramClientBotToken) return;

  const chatId = String(msg.chat.id);
  const text = (msg.text ?? "").trim();
  const token = org.telegramClientBotToken;

  if (text.startsWith("/start client_")) {
    const rest = text.slice("/start client_".length);
    const underscore = rest.indexOf("_");
    const clientId = underscore >= 0 ? rest.slice(0, underscore) : rest;
    const linkToken = underscore >= 0 ? rest.slice(underscore + 1) : "";
    const client = await Client.findOne({
      _id: new mongoose.Types.ObjectId(clientId),
      orgId: orgIdObj,
      telegramLinkToken: linkToken,
      telegramLinkTokenExpiresAt: { $gt: new Date() },
    }).lean();
    if (client) {
      await Client.findByIdAndUpdate(client._id, {
        telegramChatId: chatId,
        $unset: { telegramLinkToken: 1, telegramLinkTokenExpiresAt: 1 },
      });
      await sendMessage(
        token,
        chatId,
        `✅ You're linked as <b>${escapeHtml(client.name ?? "Client")}</b>. Send your task description and we'll add it as a new project.`
      );
    } else {
      await sendMessage(token, chatId, "This link has expired or is invalid. Ask your contact for a new link.");
    }
    return;
  }

  if (text === "/start" || text.startsWith("/start ")) {
    await sendMessage(token, chatId, "Use the link your contact sent you to get started. If you don't have one, ask them for a Telegram link.");
    return;
  }

  const client = await Client.findOne({ orgId: orgIdObj, telegramChatId: chatId }).lean();
  if (client) {
    const orgWithTemplates = await Organization.findById(orgIdObj).select("projectTemplates").lean();
    const templates = (orgWithTemplates?.projectTemplates as { name: string; checklist: string[] }[] | undefined) ?? [];
    const lowerText = text.toLowerCase();
    const matched = [...templates]
      .filter((t) => t.name && String(t.name).trim())
      .sort((a, b) => String(b.name).length - String(a.name).length)
      .find((t) => lowerText.startsWith(String(t.name).toLowerCase().trim()));
    const templateList = matched?.checklist;

    let name: string;
    const description = text || null;
    let checklist: { title: string; done: boolean; value?: string }[];
    const useAi = !!process.env.GROQ_API_KEY;

    try {
      const parsed =
        useAi
          ? await parseProjectMessageWithGroq(
              text,
              templateList && templateList.length > 0 ? templateList : undefined
            )
          : null;
      if (parsed?.name) {
        name = parsed.name;
        checklist = parsed.checklist.map((i) => ({
            title: i.title,
          done: false,
          ...(i.value ? { value: i.value } : {}),
        }));
      } else {
        throw new Error("No AI result");
      }
    } catch {
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const firstLine = lines[0] || text || "New task from Telegram";
      name = firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine.slice(0, 300);
      const parsedPairs: { key: string; value: string }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const colon = line.indexOf(":");
        if (colon > 0) {
          const key = line.slice(0, colon).trim();
          const value = line.slice(colon + 1).trim();
          if (key && value) parsedPairs.push({ key: key.toLowerCase(), value });
        }
      }
      const list = templateList && templateList.length > 0 ? templateList : [];
      checklist =
        list.length > 0
          ? list.map((title) => {
              const t = String(title).trim();
              if (!t) return null;
              const key = t.toLowerCase();
              const pair = parsedPairs.find((p) => p.key === key || key.includes(p.key) || p.key.includes(key));
              const value = pair?.value;
              return { title: t, done: false, ...(value ? { value } : {}) };
            }).filter((i): i is { title: string; done: boolean; value?: string } => i !== null && !!i.title)
          : [
              { title: "Scope confirmed", done: false },
              { title: "In progress", done: false },
            ];
    }

    const priceFromChecklist = checklist.find(
      (i) => i.value && /price|amount|budget/i.test(i.title)
    )?.value;
    const parsed = parsePrice(priceFromChecklist ?? text);
    const valueInr = parsed?.value;
    const currency = parsed?.currency ?? "INR";

    await Project.create({
      clientId: client._id,
      name,
      description: description || undefined,
      checklist,
      receivedVia: "telegram",
      ...(valueInr != null ? { valueInr, currency } : {}),
    });
    const clientName = client.name ?? "Client";
    await sendMessage(token, chatId, `✅ Done! Project "<b>${escapeHtml(name.slice(0, 100))}</b>" has been added. Your team will see it in the dashboard.`);

    const assigneeId = client.assignedTo?.toString();
    if (assigneeId) {
      const assignee = await User.findById(assigneeId).select("telegramChatId").lean();
      if (assignee?.telegramChatId) {
        const orgTeam = await Organization.findById(orgIdObj).select("telegramBotToken").lean();
        const teamToken = orgTeam?.telegramBotToken;
        if (teamToken) {
          await sendMessage(
            teamToken,
            assignee.telegramChatId,
            `📌 <b>New task created</b>\n\nClient: <b>${escapeHtml(clientName)}</b>\nProject: <b>${escapeHtml(name.slice(0, 100))}</b>\n\nView it in the dashboard.`
          );
        }
      }
    }
    return;
  }

  await sendMessage(token, chatId, "Use the link your contact sent you to link this chat first.");
}
