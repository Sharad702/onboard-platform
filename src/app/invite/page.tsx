"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "signin" | "error" | "already" | "ok">("loading");
  const [message, setMessage] = useState("");
  const [workspace, setWorkspace] = useState<{ orgId: string; workspaceName: string } | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace("/dashboard");
      return;
    }
    fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) {
          if (res.status === 401) {
            fetch(`/api/invite/validate?token=${encodeURIComponent(token)}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.orgId && d.workspaceName) setWorkspace({ orgId: d.orgId, workspaceName: d.workspaceName });
                setStatus("signin");
              })
              .catch(() => setStatus("signin"));
          } else if (data.already) {
            setStatus("already");
            if (data.orgId) setTimeout(() => router.replace(`/dashboard?workspace=${data.orgId}`), 1500);
          } else {
            setStatus("error");
            setMessage(data.error || "Invalid or expired invite.");
          }
          return;
        }
        if (data.already) {
          setStatus("already");
          if (data.orgId) setTimeout(() => router.replace(`/dashboard?workspace=${data.orgId}`), 1500);
          return;
        }
        if (data.orgId) router.replace(`/dashboard?workspace=${data.orgId}`);
        else setStatus("ok");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong.");
      });
  }, [token, router]);

  if (status === "signin") {
    const handleJoin = () => {
      if (workspace) {
        signIn("invite", {
          inviteToken: token,
          callbackUrl: `/dashboard?workspace=${workspace.orgId}`,
        });
      } else {
        signIn("invite", { inviteToken: token, callbackUrl: "/dashboard" });
      }
    };
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="text-center max-w-sm">
          <p className="text-[var(--fg-muted)]">
            {workspace ? (
              <>You’re invited to join <strong className="text-[var(--fg)]">{workspace.workspaceName}</strong></>
            ) : (
              "Join workspace"
            )}
          </p>
          <button
            type="button"
            onClick={handleJoin}
            className="mt-4 btn-press btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
          >
            Join and open dashboard
          </button>
          <p className="mt-4 text-xs text-[var(--fg-dim)]">
            No account? One will be created with the invite email. You’ll be logged in automatically.
          </p>
          <Link href={`/login?next=${encodeURIComponent("/invite?token=" + token)}`} className="mt-3 inline-block text-sm text-[var(--accent)] hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </main>
    );
  }

  if (status === "already" || status === "ok") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="text-center">
          <p className="text-[var(--fg-muted)]">Joining workspace…</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--accent)] hover:underline">Go to dashboard</Link>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="text-center">
          <p className="text-[var(--fg-muted)]">{message}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--accent)] hover:underline">Go to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="text-center">
        <p className="text-[var(--fg-muted)]">Accepting invite…</p>
      </div>
    </main>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]"><div className="text-[var(--fg-dim)]">Loading…</div></main>}>
      <InviteContent />
    </Suspense>
  );
}
