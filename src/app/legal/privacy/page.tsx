export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-zinc max-w-none">
      <h1 className="text-2xl font-semibold text-[var(--fg)]">Privacy Policy</h1>
      <p className="text-sm text-[var(--fg-dim)] mt-1">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <section className="mt-6 space-y-4 text-[var(--fg-muted)] text-sm">
        <h2 className="text-lg font-medium text-[var(--fg)]">1. Information we collect</h2>
        <p>
          We collect information you provide when signing up (email), when you add clients (name, email, company, phone, address, GSTIN), and when you or your clients use the portal (file uploads, contract actions). We also collect usage data to run the service.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">2. How we use it</h2>
        <p>
          We use your data to provide OnboardEasy (dashboard, client portal, proposals, invoices, notifications) and to improve the product. We do not sell your data to third parties.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">3. Data storage and security</h2>
        <p>
          Data is stored on secure servers. We use industry-standard practices to protect your information. Client portal access is via time-limited magic links.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">4. Your rights</h2>
        <p>
          You can request access, correction, or deletion of your data by contacting us. Under applicable law (including India’s DPDP Act), you may have additional rights as described in our DPDP notice.
        </p>

        <h2 className="text-lg font-medium text-[var(--fg)]">5. Contact</h2>
        <p>
          For privacy-related questions, contact us at the email provided on the app or website.
        </p>
      </section>
    </article>
  );
}
