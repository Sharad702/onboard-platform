import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft } from "lucide-react";
import CreateInvoiceForm from "@/app/dashboard/clients/[id]/invoice/CreateInvoiceForm";

export default async function InvoicePage({
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

  return (
    <div className="max-w-xl animate-fade-in">
      <Link
        href={`/dashboard/clients/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {client.name}
      </Link>
      <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Create invoice</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Enter the description and amount. You can view or print the invoice to send to the client.
      </p>
      <CreateInvoiceForm clientId={id} />
    </div>
  );
}
