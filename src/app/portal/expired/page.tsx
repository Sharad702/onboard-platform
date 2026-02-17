import Link from "next/link";

export default function PortalExpiredPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="text-center animate-fade-up">
        <h1 className="text-xl font-semibold text-[var(--fg)]">Link expired</h1>
        <p className="mt-2 text-[var(--fg-muted)]">
          This client portal link has expired.
        </p>
        <p className="mt-4 text-sm text-[var(--fg-dim)]">
          Ask your freelancer to send you a new link.
        </p>
        <Link href="/" className="mt-6 inline-block btn-primary rounded-xl px-5 py-2.5 font-medium transition">
          Go to OnboardEasy
        </Link>
      </div>
    </main>
  );
}
