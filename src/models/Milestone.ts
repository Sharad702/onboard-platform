import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    dueDate: Date,
    completedAt: Date,
    amountInr: Number,
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Milestone || mongoose.model("Milestone", milestoneSchema);
