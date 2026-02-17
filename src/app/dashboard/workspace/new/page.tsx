import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import OrganizationMember from "@/models/OrganizationMember";
import NewWorkspaceForm from "./NewWorkspaceForm";

export default async function NewWorkspacePage() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const memberships = await OrganizationMember.find({ userId: session.user.id }).select("role").lean();
  const isInvitedOnly = memberships.length > 0 && memberships.every((m) => m.role === "member");
  if (isInvitedOnly) redirect("/dashboard");

  return <NewWorkspaceForm />;
}
