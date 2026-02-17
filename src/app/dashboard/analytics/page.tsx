import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Organization from "@/models/Organization";
import OrganizationMember from "@/models/OrganizationMember";
import { Users, Briefcase, IndianRupee, TrendingUp } from "lucide-react";
import ChartSection from "./ChartSection";
import BackToDashboardLink from "../BackToDashboardLink";

const DASHBOARD_WORKSPACE_COOKIE = "dashboard_workspace";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const userId = session.user.id;
  const memberships = await OrganizationMember.find({ userId }).select("orgId role").lean();
  const hasOwner = memberships.some((m) => m.role === "owner");
  if (memberships.length > 0 && !hasOwner) redirect("/dashboard");

  const { workspace: workspaceFromUrl } = await searchParams;
  const cookieStore = cookies();
  const workspaceFromCookie = cookieStore.get(DASHBOARD_WORKSPACE_COOKIE)?.value;
  const selectedWorkspaceId = workspaceFromUrl || workspaceFromCookie || null;

  const isOwnerOfSelected =
    selectedWorkspaceId &&
    memberships.some((m) => m.orgId.toString() === selectedWorkspaceId && m.role === "owner");

  const clientFilter =
    selectedWorkspaceId && isOwnerOfSelected
      ? { orgId: selectedWorkspaceId }
      : { ownerId: userId, orgId: null };

  const scopeLabel =
    selectedWorkspaceId && isOwnerOfSelected
      ? (await Organization.findById(selectedWorkspaceId).select("name").lean())?.name ?? "Workspace"
      : "Personal";

  const clientsCount = await Client.countDocuments(clientFilter);

  const clientIds = (await Client.find(clientFilter).select("_id").lean()).map((c) => c._id);
  const projects = await Project.find({ clientId: { $in: clientIds } })
    .select("_id name valueInr status createdAt")
    .lean();

  const totalRevenue = projects?.reduce((s, p) => s + (Number(p.valueInr) || 0), 0) ?? 0;
  const withValue = projects?.filter((p) => p.valueInr != null).length ?? 0;
  const avgValue = withValue > 0 ? totalRevenue / withValue : 0;
  const completed = projects?.filter((p) => p.status === "completed").length ?? 0;
  const winRate = (projects?.length ?? 0) > 0 ? Math.round((completed / (projects?.length ?? 1)) * 100) : 0;

  const monthMap: Record<string, number> = {};
  projects?.forEach((p) => {
    if (p.valueInr == null) return;
    const m = new Date(p.createdAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
    monthMap[m] = (monthMap[m] || 0) + Number(p.valueInr);
  });
  const chartData = Object.entries(monthMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="animate-fade-in">
      <BackToDashboardLink workspaceId={selectedWorkspaceId} />
      <h1 className="text-xl font-semibold text-[var(--fg)] mb-1">Analytics</h1>
      <p className="text-sm text-[var(--fg-dim)] mb-6">Showing: {scopeLabel}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2 text-[var(--fg-dim)] text-sm mb-1">
            <Users className="h-4 w-4 text-[var(--accent)]" />
            Total clients
          </div>
          <p className="text-2xl font-semibold text-[var(--fg)]">{clientsCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2 text-[var(--fg-dim)] text-sm mb-1">
            <Briefcase className="h-4 w-4 text-[var(--accent)]" />
            Projects
          </div>
          <p className="text-2xl font-semibold text-[var(--fg)]">{projects?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2 text-[var(--fg-dim)] text-sm mb-1">
            <IndianRupee className="h-4 w-4 text-[var(--accent)]" />
            Revenue (value)
          </div>
          <p className="text-2xl font-semibold text-[var(--fg)]">
            ₹{(totalRevenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center gap-2 text-[var(--fg-dim)] text-sm mb-1">
            <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
            Avg project value
          </div>
          <p className="text-2xl font-semibold text-[var(--fg)]">
            ₹{Math.round(avgValue).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="font-semibold text-[var(--fg)] mb-4">Revenue by month</h2>
        <ChartSection data={chartData} />
      </div>

      <p className="mt-4 text-sm text-[var(--fg-dim)]">
        Win rate (completed / total): {winRate}% · More metrics coming with Razorpay data.
      </p>
    </div>
  );
}
