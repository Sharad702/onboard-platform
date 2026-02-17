"use client";

import { Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

function LoginContent() {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding + background */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-gradient-to-br from-[#0d9488]/20 via-[var(--bg)] to-[var(--bg)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(13,148,136,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(13,148,136,0.12),transparent_40%)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="animate-fade-up max-w-sm">
            <h1 className="text-3xl font-bold text-[var(--fg)] tracking-tight">
              OnboardEasy
            </h1>
            <p className="mt-4 text-[var(--fg-muted)] text-lg leading-relaxed">
              Proposals, contracts, and client portal for freelancers and small teams.
            </p>
            <div className="mt-10 flex gap-3">
              <div className="dash-transmit-1 h-1.5 w-8 rounded-full bg-[var(--border)]" />
              <div className="dash-transmit-2 h-1.5 w-8 rounded-full bg-[var(--border)]" />
              <div className="dash-transmit-3 h-1.5 w-8 rounded-full bg-[var(--border)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[var(--bg)]">
        <div className="w-full max-w-[380px] animate-fade-up">
          <div className="lg:hidden mb-8">
            <h1 className="text-2xl font-bold text-[var(--fg)]">OnboardEasy</h1>
            <p className="mt-1 text-sm text-[var(--fg-dim)]">Sign in to continue</p>
          </div>
          <h2 className="text-xl font-semibold text-[var(--fg)] mb-1 hidden lg:block">Welcome back</h2>
          <p className="text-[var(--fg-dim)] text-sm mb-8 hidden lg:block">Sign in with your Google account</p>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/login/verify?next=/dashboard" })}
            className="btn-press w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-3.5 px-4 text-[var(--fg)] font-medium hover:bg-[var(--bg-elevated)] hover:border-[var(--border)] transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-sm text-[var(--fg-dim)]">
            <Link href="/" className="text-[var(--accent)] hover:underline">
              ← Back to home
            </Link>
          </p>
          <p className="mt-6 flex justify-center gap-4 text-xs text-[var(--fg-dim)]">
            <Link href="/legal/privacy" className="hover:text-[var(--fg-muted)]">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-[var(--fg-muted)]">Terms</Link>
            <Link href="/legal/dpdp" className="hover:text-[var(--fg-muted)]">DPDP</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-[var(--fg-dim)]">Loading…</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
