"use client";

import { useState, useEffect } from "react";
import { Check, Circle, FileText } from "lucide-react";

type Project = { id: string; name: string; status: string; value_inr: number | null; contract_signed_at: string | null };
type Milestone = { id: string; project_id: string; title: string; completed_at: string | null };
type Invoice = { id: string; project_id: string; amount_inr: number; status: string };

type Props = {
  clientId: string;
  clientName: string;
  token: string;
  logoUrl: string | null;
  primaryColor: string;
  projects: Project[];
  milestones: Milestone[];
  invoices: Invoice[];
};

export default function ClientPortalView({
  clientName,
  token,
  logoUrl,
  primaryColor,
  projects,
  milestones,
  invoices,
}: Props) {
  const [signing, setSigning] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ id: string; fileName: string; filePath: string; size: number }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetch(`/api/portal/documents?token=${encodeURIComponent(token)}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setDocuments)
      .catch(() => setDocuments([]));
  }, [token]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="file"]') as HTMLInputElement;
    if (!input?.files?.length) return;
    setUploadError("");
    setUploading(true);
    const fd = new FormData();
    fd.set("token", token);
    fd.set("file", input.files[0]);
    const res = await fetch("/api/portal/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      setDocuments((prev) => [{ id: data.id, fileName: data.fileName, filePath: data.filePath, size: 0 }, ...prev]);
      input.value = "";
    } else {
      const err = await res.json();
      setUploadError(err.error || "Upload failed");
    }
  }

  async function handleSign(projectId: string) {
    setSigning(projectId);
    await fetch("/api/portal/e-sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, projectId }),
    });
    setSigning(null);
    window.location.reload();
  }

  const milestonesByProject: Record<string, Milestone[]> = {};
  milestones.forEach((m) => {
    if (!milestonesByProject[m.project_id]) milestonesByProject[m.project_id] = [];
    milestonesByProject[m.project_id].push(m);
  });

  const accentStyle = { "--portal-accent": primaryColor } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-app p-6" style={accentStyle}>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-lg font-semibold text-[var(--fg)]">OnboardEasy</span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-[var(--fg)]">Hi, {clientName}</h1>
        <p className="mt-0.5 text-sm text-[var(--fg-dim)]">Your project progress and actions.</p>

        <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="font-semibold text-[var(--fg)] mb-3">Progress</h2>
          {!projects.length ? (
            <p className="text-sm text-[var(--fg-dim)]">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => {
                const ms = milestonesByProject[p.id] ?? [];
                const done = ms.filter((m) => m.completed_at).length;
                const progress = ms.length ? Math.round((done / ms.length) * 100) : 0;
                return (
                  <div key={p.id} className="rounded-lg border border-[var(--border-subtle)] p-3">
                    <p className="font-medium text-[var(--fg)]">{p.name}</p>
                    <p className="text-sm text-[var(--fg-dim)]">{p.status}</p>
                    {ms.length > 0 && (
                      <>
                        <div className="mt-2 flex justify-between text-xs text-[var(--fg-dim)]">
                          <span>Milestones {done}/{ms.length}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div className="h-full rounded-full transition-[width]" style={{ width: `${progress}%`, backgroundColor: primaryColor }} />
                        </div>
                        <ul className="mt-2 space-y-1">
                          {ms.slice(0, 5).map((m) => (
                            <li key={m.id} className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
                              {m.completed_at ? <Check className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-[var(--fg-dim)]" />}
                              {m.title}
                            </li>
                          ))}
                          {ms.length > 5 && <li className="text-xs text-[var(--fg-dim)]">+{ms.length - 5} more</li>}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="font-semibold text-[var(--fg)] mb-3">Actions</h2>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-3">
                <div>
                  <p className="font-medium text-[var(--fg)]">{p.name}</p>
                  <p className="text-sm text-[var(--fg-dim)]">
                    Contract {p.contract_signed_at ? "signed" : "pending"}
                  </p>
                </div>
                {!p.contract_signed_at ? (
                  <button
                    type="button"
                    onClick={() => handleSign(p.id)}
                    disabled={!!signing}
                    className="btn-press rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {signing === p.id ? "Signing…" : "E-sign"}
                  </button>
                ) : (
                  <span className="text-sm text-emerald-500">Signed</span>
                )}
              </div>
            ))}
          </div>
          {invoices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-sm font-medium text-[var(--fg-muted)] mb-2">Invoices</h3>
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] p-3 mt-2">
                  <span className="text-[var(--fg)]">₹{Number(inv.amount_inr).toLocaleString("en-IN")}</span>
                  <a
                    href="#"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Pay (Razorpay coming soon)
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-sm font-medium text-[var(--fg-muted)] mb-2">Documents</h3>
            <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-2">
              <label className="flex-1 min-w-[140px]">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  className="block w-full text-sm text-[var(--fg-muted)] file:mr-2 file:rounded-md file:border-0 file:bg-[var(--bg-elevated)] file:px-3 file:py-2 file:text-[var(--fg)]"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
              </label>
              <button type="submit" disabled={uploading} className="rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </form>
            {uploadError && <p className="mt-1 text-sm text-red-400">{uploadError}</p>}
            {documents.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 rounded-md bg-[var(--bg-elevated)] px-3 py-2">
                    <FileText className="h-4 w-4 text-[var(--fg-dim)] shrink-0" />
                    <a href={d.filePath} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--fg)] hover:underline truncate flex-1">
                      {d.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-[var(--fg-dim)]">No documents yet. PDF, Word, or images, max 10MB.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
