import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft, MessageCircle } from "lucide-react";
import AIChatBox from "./AIChatBox";

export const dynamic = "force-dynamic";

export default async function AIChatPage({
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

  const clientIdStr = client._id.toString();

  return (
    <div className="max-w-2xl animate-fade-in">
      <Link
        href={`/dashboard/clients/${clientIdStr}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {client.name}
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-1 flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-[var(--accent)]" />
        Ask AI
      </h1>
      <p className="text-zinc-500 text-sm mb-6">
        Ask doubts about proposals, timelines, pricing, or anything for this client. Answers are based on your context.
      </p>
      <AIChatBox
        clientId={clientIdStr}
        clientContext={{
          clientName: client.name,
          clientCompany: client.company ?? undefined,
        }}
      />
    </div>
  );
}
