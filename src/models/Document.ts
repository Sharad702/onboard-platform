import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    uploadedBy: { type: String, enum: ["client", "dashboard"], default: "client" },
  },
  { timestamps: true }
);

documentSchema.index({ clientId: 1, createdAt: -1 });

export default mongoose.models.Document || mongoose.model("Document", documentSchema);
