import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-semibold text-[var(--fg)] hover:opacity-90">OnboardEasy</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/legal/privacy" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">Privacy</Link>
            <Link href="/legal/terms" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">Terms</Link>
            <Link href="/legal/dpdp" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">DPDP</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}
