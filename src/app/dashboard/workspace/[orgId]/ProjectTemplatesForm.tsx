"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Template = { name: string; checklist: string[] };

export default function ProjectTemplatesForm({
  orgId,
  initialTemplates,
}: {
  orgId: string;
  initialTemplates: Template[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTemplate(i: number, updates: Partial<Template>) {
    setTemplates((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, ...updates } : t))
    );
  }

  function addTemplate() {
    setTemplates((prev) => [...prev, { name: "", checklist: [] }]);
  }

  function removeTemplate(i: number) {
    setTemplates((prev) => prev.filter((_, idx) => idx !== i));
  }

  function parseChecklistInput(raw: string): string[] {
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function formatChecklistForInput(checklist: string[]): string {
    return checklist.join(", ");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = templates
      .map((t) => {
        const name = t.name.trim();
        if (!name) return null;
        const checklist =
          Array.isArray(t.checklist) && t.checklist.length > 0
            ? t.checklist
            : typeof (t as unknown as { checklistInput?: string }).checklistInput === "string"
              ? parseChecklistInput((t as unknown as { checklistInput: string }).checklistInput)
              : [];
        return { name, checklist };
      })
      .filter(Boolean) as Template[];
    const res = await fetch(`/api/workspace/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectTemplates: payload }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <p className="text-sm text-[var(--fg-dim)]">
        When a client sends a message that <strong>starts with</strong> the template name, we use that template’s checklist. They can add lines like <code className="text-xs bg-[var(--bg-elevated)] px-1 rounded">Flight: Emirates</code>, <code className="text-xs bg-[var(--bg-elevated)] px-1 rounded">Price: 5000</code> to pre-fill. Add templates e.g. Ticket, Hotel booking, Website design.
      </p>
      {templates.map((t, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 space-y-3"
        >
          <div className="flex gap-2 items-center justify-between">
            <input
              type="text"
              value={t.name}
              onChange={(e) => updateTemplate(i, { name: e.target.value })}
              placeholder="Template name (e.g. Ticket, Hotel booking)"
              className="input-dark flex-1"
            />
            <button
              type="button"
              onClick={() => removeTemplate(i)}
              className="p-2 text-zinc-500 hover:text-red-400"
              title="Remove template"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            value={formatChecklistForInput(t.checklist)}
            onChange={(e) =>
              updateTemplate(i, { checklist: parseChecklistInput(e.target.value) })
            }
            placeholder="Checklist items, comma-separated (e.g. Flight, Time, Price or Date, Check-in, Check-out, Location, Price)"
            className="input-dark w-full text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addTemplate}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
      >
        <Plus className="h-4 w-4" />
        Add template
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading || templates.every((t) => !t.name.trim())}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save templates"}
      </button>
    </form>
  );
}
