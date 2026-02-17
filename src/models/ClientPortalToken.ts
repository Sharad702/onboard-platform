import mongoose from "mongoose";

const clientPortalTokenSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.ClientPortalToken || mongoose.model("ClientPortalToken", clientPortalTokenSchema);
