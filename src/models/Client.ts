import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: String,
    phone: String,
    gstin: String,
    address: String,
    notes: String,
    onboardedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

clientSchema.index({ ownerId: 1, email: 1 }, { unique: true, partialFilterExpression: { orgId: null } });
clientSchema.index({ orgId: 1, email: 1 }, { unique: true, partialFilterExpression: { orgId: { $ne: null } } });

export default mongoose.models.Client || mongoose.model("Client", clientSchema);
