import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import OrganizationMember from "@/models/OrganizationMember";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft } from "lucide-react";
import ClientEditForm from "./ClientEditForm";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const client = await Client.findById(id).lean();
  if (!client) notFound();

  const can = await canAccessClient(session.user.id, client);
  if (!can) notFound();

  if (client.orgId) {
    const mem = await OrganizationMember.findOne({ orgId: client.orgId, userId: session.user.id }).select("role").lean();
    if (mem?.role === "member") notFound();
  }

  const clientData = {
    id: client._id.toString(),
    name: client.name,
    email: client.email,
    company: client.company ?? null,
    phone: client.phone ?? null,
    telegramUsername: (client as { telegramUsername?: string | null }).telegramUsername ?? null,
    gstin: client.gstin ?? null,
    address: client.address ?? null,
    notes: client.notes ?? null,
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link href={`/dashboard/clients/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition">
        <ArrowLeft className="h-4 w-4" />
        Back to client
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--fg)] mb-6">Edit client</h1>
      <ClientEditForm client={clientData} />
    </div>
  );
}
