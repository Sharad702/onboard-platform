import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    name: { type: String, required: true },
    description: { type: String, default: null },
    status: { type: String, default: "active", enum: ["active", "completed", "on_hold", "cancelled"] },
    statusChangedAt: { type: Date },
    valueInr: Number,
    currency: { type: String, default: "INR" },
    startDate: Date,
    endDate: Date,
    checklist: { type: [mongoose.Schema.Types.Mixed], default: [] },
    contractSignedAt: Date,
    /** How the task was received: "telegram" | "manual" */
    receivedVia: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
