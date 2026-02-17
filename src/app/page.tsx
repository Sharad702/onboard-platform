import Link from "next/link";
import { Users, Sparkles, LayoutDashboard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_20%,rgba(13,148,136,0.2),transparent_50%)] animate-glow-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_70%,rgba(13,148,136,0.1),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--bg)_100%)]" />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--fg) 1px, transparent 1px), linear-gradient(90deg, var(--fg) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Centered content block - not stuck to edges */}
      <div className="w-full max-w-5xl mx-auto flex flex-1 items-stretch">
        {/* Left: Content */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 relative z-10">
          <div className="max-w-md">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)] animate-fade-up"
            style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}
          >
            OnboardEasy
          </h1>
          <p
            className="mt-4 text-lg text-[var(--fg-muted)] leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.25s", opacity: 0, animationFillMode: "forwards" }}
          >
            Proposals, contracts, and client portal for freelancers and small teams in India.
          </p>
          <div
            className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up"
            style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}
          >
            <Link
              href="/dashboard"
              className="btn-press btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg shadow-[var(--accent)]/20 transition hover:shadow-[var(--accent)]/30 hover:scale-[1.02]"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/40"
            >
              Log in
            </Link>
          </div>
          <footer
            className="mt-14 flex gap-6 text-sm text-[var(--fg-dim)] animate-fade-up"
            style={{ animationDelay: "0.55s", opacity: 0, animationFillMode: "forwards" }}
          >
            <Link href="/legal/privacy" className="hover:text-[var(--fg-muted)] transition-colors">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-[var(--fg-muted)] transition-colors">
              Terms
            </Link>
            <Link href="/legal/dpdp" className="hover:text-[var(--fg-muted)] transition-colors">
              DPDP
            </Link>
          </footer>
          </div>
        </div>

        {/* Right: Features with icons + animation */}
        <div className="hidden lg:flex lg:w-[48%] items-center px-8 lg:px-12 relative z-10">
        <div className="w-full max-w-md space-y-4">
          <p
            className="text-xs font-semibold text-[var(--fg-dim)] uppercase tracking-[0.2em] animate-slide-up-in"
            style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
          >
            What you get
          </p>
          <ul className="space-y-3">
            {[
              {
                icon: Users,
                text: "Add clients, send portal link, track onboarding",
                delay: "0.35s",
              },
              {
                icon: Sparkles,
                text: "AI proposals, checklists, contracts & GST-style invoices",
                delay: "0.5s",
              },
              {
                icon: LayoutDashboard,
                text: "Client portal: e-sign, file upload, progress at a glance",
                delay: "0.65s",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 px-5 py-4 animate-slide-up-in transition-all duration-300 hover:border-[var(--accent)]/30 hover:bg-[var(--bg-card)] hover:shadow-lg hover:shadow-[var(--accent)]/5 hover:-translate-y-0.5"
                  style={{
                    animationDelay: item.delay,
                    opacity: 0,
                    animationFillMode: "forwards",
                  }}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[var(--fg-muted)]">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}
