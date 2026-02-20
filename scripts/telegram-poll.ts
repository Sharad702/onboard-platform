/**
 * Run both Telegram bots locally (no ngrok). One command.
 * npm run telegram:poll
 *
 * Add Team bot + Client bot in workspace settings (paste tokens). Then run this.
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { connectDB } from "../src/lib/db";
import Organization from "../src/models/Organization";
import { deleteWebhook, getUpdates } from "../src/lib/telegram";
import { processTeamBotUpdate, type TelegramUpdate as TeamUpdate } from "../src/lib/telegram-team-handler";
import { processClientBotUpdate, type TelegramUpdate as ClientUpdate } from "../src/lib/telegram-client-handler";

const POLL_TIMEOUT = 12;

async function main() {
  await connectDB();

  const orgId = process.env.TELEGRAM_POLL_ORG_ID;
  const hasToken = (v: string | null | undefined) => v && String(v).trim().length > 0;

  const query = orgId
    ? Organization.findOne({ _id: orgId })
    : Organization.findOne({
        $or: [
          { telegramBotToken: { $exists: true, $nin: [null, ""] } },
          { telegramClientBotToken: { $exists: true, $nin: [null, ""] } },
        ],
      });
  const org = await query
    .select("_id name telegramBotToken telegramBotUsername telegramClientBotToken telegramClientBotUsername")
    .lean();

  if (!org) {
    console.error("No workspace found. Create a workspace and add at least one bot (Team or Client) in workspace settings.");
    process.exit(1);
  }

  const id = org._id.toString();
  const hasTeam = hasToken(org.telegramBotToken);
  const hasClient = hasToken(org.telegramClientBotToken);

  if (!hasTeam && !hasClient) {
    console.error("No bot found. In workspace settings add Team bot and/or Client bot (paste token from @BotFather), then run again.");
    process.exit(1);
  }

  if (hasTeam) await deleteWebhook(org.telegramBotToken!);
  if (hasClient) await deleteWebhook(org.telegramClientBotToken!);

  console.log(`[Telegram] Workspace: ${org.name} (${id})`);
  if (hasTeam) console.log(`  Team bot: @${org.telegramBotUsername ?? "?"}`);
  if (hasClient) console.log(`  Client bot: @${org.telegramClientBotUsername ?? "?"}`);
  console.log("Listening. Ctrl+C to stop.\n");

  let teamOffset = 0;
  let clientOffset = 0;

  for (;;) {
    if (hasTeam) {
      try {
        const { updates, nextOffset } = await getUpdates(org.telegramBotToken!, teamOffset, POLL_TIMEOUT);
        teamOffset = nextOffset;
        for (const u of updates as TeamUpdate[]) {
          try {
            await processTeamBotUpdate(id, u);
          } catch (err) {
            console.error("[Team] Error:", err);
          }
        }
      } catch (err) {
        console.error("[Team] getUpdates error:", err);
      }
    }
    if (hasClient) {
      try {
        const { updates, nextOffset } = await getUpdates(org.telegramClientBotToken!, clientOffset, POLL_TIMEOUT);
        clientOffset = nextOffset;
        for (const u of updates as ClientUpdate[]) {
          try {
            await processClientBotUpdate(id, u);
          } catch (err) {
            console.error("[Client] Error:", err);
          }
        }
      } catch (err) {
        console.error("[Client] getUpdates error:", err);
      }
    }
  }
}

main();
