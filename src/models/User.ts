import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, default: "" },
    companyName: { type: String, default: "" },
    phone: String,
    gstin: String,
    plan: { type: String, default: "free", enum: ["free", "basic", "pro", "agency"] },
    clientLimit: { type: Number, default: 3 },
    /** Telegram chat_id for notifications (e.g. new project added for assigned client). */
    telegramChatId: { type: String, default: null },
    /** One-time token for "Connect Telegram" link (expires in ~15 min). */
    telegramLinkToken: { type: String, default: null },
    telegramLinkTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
