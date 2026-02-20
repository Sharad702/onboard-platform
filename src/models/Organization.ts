import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    logoUrl: { type: String, default: null },
    primaryColor: { type: String, default: "#0d9488" },
    /** Team bot: notifications for assignees (Connect Telegram link). */
    telegramBotToken: { type: String, default: null },
    telegramWebhookSecret: { type: String, default: null },
    telegramBotUsername: { type: String, default: null },
    /** Client bot: clients get a per-client link; they message to add projects (no email ask). */
    telegramClientBotToken: { type: String, default: null },
    telegramClientWebhookSecret: { type: String, default: null },
    telegramClientBotUsername: { type: String, default: null },
    /** When client sends a message starting with template name, this checklist is used for the project. */
    projectTemplates: {
      type: [{ name: String, checklist: [String] }],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
