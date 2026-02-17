import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    logoUrl: { type: String, default: null },
    primaryColor: { type: String, default: "#0d9488" },
  },
  { timestamps: true }
);

export default mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
