import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import Invoice from "@/models/Invoice";
import Organization from "@/models/Organization";
import OrganizationMember from "@/models/OrganizationMember";
import User from "@/models/User";
import { canAccessClient } from "@/lib/auth-helpers";
import { ArrowLeft } from "lucide-react";
import InvoicePrintView from "./InvoicePrintView";
import PrintButton from "./PrintButton";
import DownloadPDFButton from "./DownloadPDFButton";
import MarkAsPaidButton from "./MarkAsPaidButton";
import EditDueDate from "./EditDueDate";
import ScrollToTop from "./ScrollToTop";

export const dynamic = "force-dynamic";

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string; invoiceId: string }>;
}) {
  const { id, invoiceId } = await params;
  const session = await getSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const client = await Client.findById(id).lean();
  if (!client) notFound();

  const can = await canAccessClient(session.user.id, client);
  if (!can) notFound();

  let currentUserRole: string | null = null;
  if (client.orgId) {
    const mem = await OrganizationMember.findOne({ orgId: client.orgId, userId: session.user.id }).select("role").lean();
    currentUserRole = mem?.role ?? null;
  }

  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) notFound();

  const belongsToClient =
    (invoice.clientId && invoice.clientId.toString() === id) ||
    (invoice.projectId && (await Project.findOne({ _id: invoice.projectId, clientId: id }).lean()));
  if (!belongsToClient) notFound();

  const project = invoice.projectId
    ? await Project.findOne({ _id: invoice.projectId, clientId: id }).lean()
    : null;
  const descriptionOrProjectName = invoice.description ?? project?.name ?? "Invoice";

  const clientIdStr = client._id.toString();
  const invoiceNum = `INV-${invoice._id.toString().slice(-8).toUpperCase()}`;
  const issuedDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const dueDateStr = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const fromName = client.orgId
    ? (await Organization.findById(client.orgId).select("name").lean())?.name ?? "Workspace"
    : (await User.findById(session.user.id).select("fullName email").lean())?.fullName?.trim() ||
      session.user.email ||
      "—";
  const fromSubline = client.orgId ? "Invoice for client" : undefined;

  return (
    <div className="max-w-2xl print:bg-white print:min-h-screen">
      <ScrollToTop />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/dashboard/clients/${clientIdStr}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {client.name}
        </Link>
        <div className="flex items-center gap-3">
          {currentUserRole !== "member" && (
            <MarkAsPaidButton invoiceId={invoiceId} currentStatus={invoice.status} />
          )}
          <DownloadPDFButton />
          <PrintButton />
        </div>
      </div>

      {currentUserRole !== "member" && (
        <div className="mb-4 print:hidden">
          <EditDueDate
            invoiceId={invoiceId}
            currentDueDate={invoice.dueDate ? new Date(invoice.dueDate).toISOString() : null}
          />
        </div>
      )}

      <InvoicePrintView
        invoiceNumber={invoiceNum}
        issuedDate={issuedDate}
        dueDate={dueDateStr}
        fromName={fromName}
        fromSubline={fromSubline}
        clientName={client.name}
        clientEmail={client.email}
        clientCompany={client.company ?? undefined}
        description={descriptionOrProjectName}
        amountInr={Number(invoice.amountInr)}
        status={invoice.status}
      />
    </div>
  );
}
