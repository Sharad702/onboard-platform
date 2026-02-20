import { connectDB } from "@/lib/db";
import Organization from "@/models/Organization";
import User from "@/models/User";
import { sendMessage } from "@/lib/telegram";

export type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

/** Team bot only: /start connect_ and /start help. No client linking or project creation. */
export async function processTeamBotUpdate(orgId: string, update: TelegramUpdate): Promise<void> {
  const msg = update.message;
  if (!msg?.chat?.id || typeof msg.chat.id !== "number") return;

  await connectDB();
  const mongoose = await import("mongoose");
  const orgIdObj = new mongoose.default.Types.ObjectId(orgId);
  const org = await Organization.findById(orgIdObj).select("telegramBotToken").lean();
  if (!org?.telegramBotToken) return;

  const chatId = String(msg.chat.id);
  const text = (msg.text ?? "").trim();
  const token = org.telegramBotToken;

  if (text.startsWith("/start connect_")) {
    const linkToken = text.slice("/start connect_".length);
    const user = await User.findOne({
      telegramLinkToken: linkToken,
      telegramLinkTokenExpiresAt: { $gt: new Date() },
    });
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        telegramChatId: chatId,
        $unset: { telegramLinkToken: 1, telegramLinkTokenExpiresAt: 1 },
      });
      await sendMessage(token, chatId, "✅ You're connected. You'll get Telegram notifications when a new project is added for a client assigned to you.");
    } else {
      await sendMessage(token, chatId, "This link has expired. Get a new link from your workspace settings.");
    }
    return;
  }

  if (text === "/start" || text === "/start help") {
    await sendMessage(
      token,
      chatId,
      "👋 This is the <b>team</b> bot. Use the \"Connect Telegram for notifications\" link from workspace settings to get notified when a new project is added for a client assigned to you."
    );
  }
}
