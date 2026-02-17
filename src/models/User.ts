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
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
