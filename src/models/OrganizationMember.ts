import mongoose from "mongoose";

const organizationMemberSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, default: "member", enum: ["owner", "admin", "member"] },
  },
  { timestamps: true }
);

organizationMemberSchema.index({ orgId: 1, userId: 1 }, { unique: true });

export default mongoose.models.OrganizationMember || mongoose.model("OrganizationMember", organizationMemberSchema);
