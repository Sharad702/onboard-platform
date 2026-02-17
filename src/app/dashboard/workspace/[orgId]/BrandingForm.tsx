"use client";

import { useState } from "react";

const DEFAULT_COLOR = "#0d9488";

export default function BrandingForm({
  orgId,
  initialName,
  initialLogoUrl,
  initialPrimaryColor,
}: {
  orgId: string;
  initialName: string;
  initialLogoUrl: string | null;
  initialPrimaryColor: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor ?? DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/workspace/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        logoUrl: logoUrl.trim() || undefined,
        primaryColor: primaryColor || DEFAULT_COLOR,
      }),
    });
    setSaving(false);
    if (res.ok) setMessage("saved");
    else setMessage("error");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-[var(--fg-muted)] mb-1">Workspace name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-dark"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--fg-muted)] mb-1">Logo URL</label>
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          className="input-dark"
        />
        <p className="mt-1 text-xs text-[var(--fg-dim)]">Shown on client portal and emails. Leave empty for default.</p>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--fg-muted)] mb-1">Primary color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-1"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--fg)] font-mono focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-press btn-primary rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save branding"}
        </button>
        {message === "saved" && <span className="text-sm text-[var(--accent)]">Saved.</span>}
        {message === "error" && <span className="text-sm text-red-400">Failed to save.</span>}
      </div>
    </form>
  );
}
