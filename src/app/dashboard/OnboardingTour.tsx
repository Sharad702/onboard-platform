"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "onboardeasy_tour_done";
const STEPS = [
  { id: "add-client", title: "Add your first client", body: "Click « Add client » to create a client. You’ll then send them a portal link and track onboarding." },
  { id: "client-portal", title: "Send the portal link", body: "Open a client, then use « Send portal link » so they can sign contracts, upload docs, and see progress." },
  { id: "project", title: "Create projects after onboarding", body: "Once you mark a client as onboarded, you can add projects, proposals, checklists, and invoices." },
  { id: "analytics", title: "Check analytics", body: "View revenue, win rate, and performance from the Analytics page when you have data." },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="relative max-w-md w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xl"
        role="dialog"
        aria-label="Onboarding tour"
      >
        <button type="button" onClick={finish} className="absolute top-3 right-3 rounded-md p-1.5 text-[var(--fg-dim)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)]" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-[var(--fg)] pr-8">{current.title}</h2>
        <p className="mt-1.5 text-sm text-[var(--fg-muted)]">{current.body}</p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1 w-5 rounded-full ${i === step ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} aria-hidden />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-lg px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg)]">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
                Next
              </button>
            ) : (
              <button type="button" onClick={finish} className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
                Done
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--fg-dim)]">
          <button type="button" onClick={finish} className="underline hover:text-[var(--fg-muted)]">Skip tour</button>
        </p>
      </div>
    </div>
  );
}
