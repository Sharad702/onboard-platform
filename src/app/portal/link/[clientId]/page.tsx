import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft } from "lucide-react";
import SendMagicLinkForm from "./SendMagicLinkForm";

export default async function PortalLinkPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) notFound();

  const can = await canAccessClient(session.user.id, client);
  if (!can) notFound();

  return (
    <div className="max-w-lg animate-fade-in">
      <Link href={`/dashboard/clients/${clientId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition">
        <ArrowLeft className="h-4 w-4" />
        Back to client
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Client portal link</h1>
      <p className="text-zinc-400 mb-6">
        Send a magic link to <strong className="text-zinc-200">{client.name}</strong> ({client.email}).
        They can view progress, upload files, sign & pay — no password.
      </p>
      <SendMagicLinkForm clientId={clientId} clientEmail={client.email} clientName={client.name} />
    </div>
  );
}
