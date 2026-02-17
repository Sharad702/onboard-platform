import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import OrganizationMember from "@/models/OrganizationMember";
import OnboardingTour from "./OnboardingTour";
import DashboardNav from "./DashboardNav";
import DashboardLogoLink from "./DashboardLogoLink";
import SignOutButton from "./SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  let canShowAnalytics = true;
  try {
    await connectDB();
    const memberships = await OrganizationMember.find({ userId: session.user.id }).select("role").lean();
    const hasOwner = memberships.some((m) => m.role === "owner");
    canShowAnalytics = memberships.length === 0 || hasOwner;
  } catch {
    canShowAnalytics = false;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] print:bg-white">
      <OnboardingTour />
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <DashboardLogoLink />
          <DashboardNav canShowAnalytics={canShowAnalytics} />
          <div className="flex items-center gap-3 border-l border-[var(--border-subtle)] pl-4">
            <span className="max-w-[200px] sm:max-w-[280px] truncate text-[13px] text-[var(--fg-dim)]" title={session.user.email ?? undefined}>
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 animate-fade-in print:max-w-none print:py-0 print:px-0">{children}</main>
    </div>
  );
}
