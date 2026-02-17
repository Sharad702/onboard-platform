"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="In the print dialog, turn off 'Headers and footers' for a clean PDF"
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
