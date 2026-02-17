"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function DownloadPDFButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    const el = document.getElementById("invoice-pdf");
    if (!el) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min(pageW / imgW, pageH / imgH) * 0.95;
      const w = imgW * ratio;
      const h = imgH * ratio;
      pdf.addImage(imgData, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h);
      pdf.save("invoice.pdf");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      title="Download PDF (only invoice, no extra text)"
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition disabled:opacity-50"
    >
      <FileDown className="h-4 w-4" />
      {loading ? "Creating…" : "Download PDF"}
    </button>
  );
}
