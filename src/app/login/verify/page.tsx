"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Building2 } from "lucide-react";

const LOGIN_MODE_COOKIE = "loginMode";
const COOKIE_DAYS = 30;

function setLoginModeCookie(mode: "personal" | "workspace") {
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${LOGIN_MODE_COOKIE}=${mode}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function ChooseModeContent() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/dashboard";
  const baseNext = next.split("?")[0];
  const { status: sessionStatus } = useSession();
  const [status, setStatus] = useState<"loading" | "choose" | "addWorkspace" | "success" | "error">("loading");
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      setStatus("error");
      return;
    }
    if (sessionStatus === "authenticated") {
      const hasMode = typeof document !== "undefined" && document.cookie.includes(`${LOGIN_MODE_COOKIE}=`);
      if (hasMode) {
        window.location.href = next;
        return;
      }
      setStatus("choose");
    }
  }, [sessionStatus, next]);

  function goPersonal() {
    setLoginModeCookie("personal");
    window.location.href = next;
  }

  function goWorkspace(workspaceId?: string) {
    setLoginModeCookie("workspace");
    const url = workspaceId ? `${baseNext}?workspace=${workspaceId}` : baseNext;
    window.location.href = url;
  }

  async function createWorkspaceAndGo(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    const name = workspaceName.trim();
    if (!name) {
      setCreateError("Enter a workspace name");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setCreateError(data.error || "Could not create workspace");
      return;
    }
    goWorkspace(data.id);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-app">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
        {status === "loading" && <p className="text-[var(--fg-muted)]">Loading…</p>}
        {status === "choose" && (
          <>
            <p className="text-[var(--fg)] mb-1">You’re signed in.</p>
            <p className="text-sm text-[var(--fg-dim)] mb-5">How are you using OnboardEasy?</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={goPersonal}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left text-[var(--fg)] hover:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              >
                <User className="h-5 w-5 shrink-0 text-[var(--fg-dim)]" />
                <div>
                  <div className="font-medium">Personal</div>
                  <div className="text-xs text-[var(--fg-dim)]">Just me, my clients</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setStatus("addWorkspace")}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-left text-[var(--fg)] hover:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              >
                <Building2 className="h-5 w-5 shrink-0 text-[var(--fg-dim)]" />
                <div>
                  <div className="font-medium">Workspace</div>
                  <div className="text-xs text-[var(--fg-dim)]">Team, multiple people</div>
                </div>
              </button>
            </div>
          </>
        )}
        {status === "addWorkspace" && (
          <>
            <p className="text-[var(--fg)] mb-1">Create your workspace</p>
            <p className="text-sm text-[var(--fg-dim)] mb-4">Give it a name. You can add more later.</p>
            <form onSubmit={createWorkspaceAndGo} className="text-left space-y-3">
              <label className="block">
                <span className="text-[13px] font-medium text-[var(--fg-muted)]">Workspace name</span>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Studio"
                  className="input-dark mt-1.5"
                  autoFocus
                />
              </label>
              {createError && <p className="text-sm text-red-400">{createError}</p>}
              <div className="flex flex-col gap-2 pt-1">
                <button type="submit" disabled={creating} className="btn-press btn-primary w-full rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">
                  {creating ? "Creating…" : "Create & continue"}
                </button>
                <button type="button" onClick={() => goWorkspace()} className="w-full rounded-lg border border-[var(--border)] py-2.5 text-sm text-[var(--fg-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--fg)]">
                  Skip for now
                </button>
              </div>
            </form>
          </>
        )}
        {status === "success" && <p className="text-[var(--accent)]">Redirecting…</p>}
        {status === "error" && (
          <>
            <p className="text-red-400">Please sign in first.</p>
            <Link href="/login" className="mt-4 inline-block text-[var(--accent)] hover:underline">Back to login</Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function ChooseModePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]"><div className="text-[var(--fg-dim)]">Loading…</div></main>}>
      <ChooseModeContent />
    </Suspense>
  );
}
