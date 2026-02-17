export default function TermsPage() {
  return (
    <article className="prose prose-invert prose-zinc max-w-none">
      <h1 className="text-2xl font-semibold text-[var(--fg)]">Terms of Service</h1>
      <p className="text-sm text-[var(--fg-dim)] mt-1">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <section className="mt-6 space-y-4 text-[var(--fg-muted)] text-sm">
        <h2 className="text-lg font-medium text-[var(--fg)]">1. Acceptance</h2>
        <p>
          By using OnboardEasy you agree to these terms and to our Privacy Policy. If you use the service on behalf of a company, you represent that you have authority to bind that company.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">2. Use of the service</h2>
        <p>
          You may use OnboardEasy for client onboarding, proposals, contracts, invoices, and related workflows. You are responsible for the accuracy of data you add and for complying with laws (e.g. GST, contracts) in your jurisdiction. You must not use the service for illegal purposes or to harm others.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">3. Account and security</h2>
        <p>
          You are responsible for keeping your account credentials and magic-link emails secure. Notify us if you suspect unauthorized access.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">4. Subscription and payment</h2>
        <p>
          Paid plans are subject to the pricing and billing terms shown at signup. Fees are in INR unless otherwise stated. We may change pricing with notice; continued use after changes constitutes acceptance.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">5. Limitation of liability</h2>
        <p>
          OnboardEasy is provided “as is.” We are not liable for indirect, incidental, or consequential damages, or for loss of data or business, to the extent permitted by law.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">6. Contact</h2>
        <p>
          For terms-related questions, contact us at the email provided on the app or website.
        </p>
      </section>
    </article>
  );
}
