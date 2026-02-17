import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft } from "lucide-react";
import NewProjectForm from "./NewProjectForm";

export default async function NewProjectPage({
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

  const isOnboarded = !!(client as { onboardedAt?: Date | null }).onboardedAt;
  if (!isOnboarded) {
    return (
      <div className="max-w-xl animate-fade-in">
        <Link href={`/dashboard/clients/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition">
          <ArrowLeft className="h-4 w-4" />
          Back to {client.name}
        </Link>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center">
          <p className="text-zinc-300">Complete client onboarding first.</p>
          <p className="mt-1 text-sm text-zinc-500">Mark this client as onboarded on their page, then you can add projects.</p>
          <Link href={`/dashboard/clients/${id}`} className="mt-4 inline-block text-sm font-medium text-brand-400 hover:text-brand-300">
            Go to client →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl animate-fade-in">
      <Link href={`/dashboard/clients/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition">
        <ArrowLeft className="h-4 w-4" />
        Back to {client.name}
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-6">New project</h1>
      <NewProjectForm clientId={id} />
    </div>
  );
}
