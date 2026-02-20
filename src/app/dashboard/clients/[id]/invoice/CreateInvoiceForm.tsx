"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, ImageUp } from "lucide-react";

type Mode = "manual" | "upload";

export default function CreateInvoiceForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadAmount, setUploadAmount] = useState("");
  const [uploadDueDate, setUploadDueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const desc = description.trim();
    if (!desc) {
      setError("Description is required.");
      return;
    }
    if (!amount || Number(amount) < 1) {
      setError("Enter a valid amount.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        description: desc,
        amountInr: Number(amount),
        dueDate: dueDate || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create invoice.");
      return;
    }
    router.push(`/dashboard/clients/${clientId}`);
    router.refresh();
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image (JPEG, PNG, WebP or GIF).");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.set("clientId", clientId);
    fd.set("image", selectedFile);
    if (uploadDesc.trim()) fd.set("description", uploadDesc.trim());
    if (uploadAmount) fd.set("amountInr", uploadAmount);
    if (uploadDueDate) fd.set("dueDate", uploadDueDate);
    const res = await fetch("/api/invoices/upload", { method: "POST", body: fd });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to upload invoice.");
      return;
    }
    router.push(`/dashboard/clients/${clientId}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
        <button
          type="button"
          onClick={() => { setMode("manual"); setError(null); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${mode === "manual" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <FileText className="h-4 w-4" />
          Create manually
        </button>
        <button
          type="button"
          onClick={() => { setMode("upload"); setError(null); setSelectedFile(null); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${mode === "upload" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          <ImageUp className="h-4 w-4" />
          Upload invoice photo
        </button>
      </div>

      {mode === "manual" ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Description *</span>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-dark mt-1"
              placeholder="e.g. Website design - Advance payment"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Amount (₹) *</span>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-dark mt-1"
              placeholder="50000"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-dark mt-1"
            />
          </label>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-press rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create invoice"}
            </button>
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="rounded-xl border border-zinc-600 px-5 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              Cancel
            </Link>
          </div>
          <p className="text-xs text-zinc-500">
            Invoice is saved as draft. You can view or print it from the client page.
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleUploadSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Invoice image *</span>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-dashed border-zinc-600 px-4 py-3 text-sm text-zinc-400 hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
              >
                {selectedFile ? selectedFile.name : "Choose image (JPEG, PNG, WebP, GIF)"}
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); fileInputRef.current && (fileInputRef.current.value = ""); }}
                  className="text-sm text-zinc-500 hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500">For invoices you received from outside (e.g. vendor, client). We’ll store the image and create an invoice entry.</p>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Description (optional)</span>
            <input
              type="text"
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              className="input-dark mt-1"
              placeholder="e.g. Vendor invoice - Feb 2025"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Amount (₹) (optional)</span>
            <input
              type="number"
              min={0}
              value={uploadAmount}
              onChange={(e) => setUploadAmount(e.target.value)}
              className="input-dark mt-1"
              placeholder="Leave blank if unknown"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-400">Due date (optional)</span>
            <input
              type="date"
              value={uploadDueDate}
              onChange={(e) => setUploadDueDate(e.target.value)}
              className="input-dark mt-1"
            />
          </label>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="btn-press rounded-xl bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Uploading…" : "Upload & create invoice"}
            </button>
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="rounded-xl border border-zinc-600 px-5 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
