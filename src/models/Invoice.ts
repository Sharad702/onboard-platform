import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    description: { type: String },
    razorpayInvoiceId: String,
    amountInr: { type: Number, required: true },
    status: { type: String, default: "pending", enum: ["pending", "paid", "draft", "sent", "partially_paid", "cancelled"] },
    dueDate: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
