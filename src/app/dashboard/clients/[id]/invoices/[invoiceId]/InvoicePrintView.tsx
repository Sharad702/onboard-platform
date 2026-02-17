export default function InvoicePrintView({
  invoiceNumber,
  issuedDate,
  dueDate,
  fromName,
  fromSubline,
  clientName,
  clientEmail,
  clientCompany,
  description,
  amountInr,
  status,
}: {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  fromName: string;
  fromSubline?: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  description: string;
  amountInr: number;
  status: string;
}) {
  return (
    <article id="invoice-pdf" className="rounded-2xl border border-zinc-800 bg-white shadow-xl print:border print:shadow-none overflow-hidden">
      <div className="bg-[var(--accent)] px-8 py-6 print:bg-teal-600">
        <p className="text-white/90 text-sm font-medium uppercase tracking-wider">Invoice</p>
        <h1 className="text-2xl font-bold text-white mt-1">{invoiceNumber}</h1>
        <div className="mt-4 flex flex-wrap gap-8 text-sm">
          <div>
            <span className="text-white/80">Issued</span>
            <p className="font-semibold text-white">{issuedDate}</p>
          </div>
          <div>
            <span className="text-white/80">Due date</span>
            <p className="font-semibold text-white">{dueDate}</p>
          </div>
          <div>
            <span className="text-white/80">Status</span>
            <p className="font-semibold text-white">{status === "paid" ? "Paid" : "Pending"}</p>
          </div>
        </div>
      </div>

      <div className="p-8 text-zinc-900">
        <div className="grid gap-8 sm:grid-cols-2 mb-8">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">From</p>
            <p className="font-bold text-zinc-900 text-lg">{fromName}</p>
            {fromSubline ? <p className="text-sm text-zinc-600">{fromSubline}</p> : null}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Bill to</p>
            <p className="font-bold text-zinc-900 text-lg">{clientName}</p>
            <p className="text-sm text-zinc-600">{clientEmail}</p>
            {clientCompany && <p className="text-sm text-zinc-600">{clientCompany}</p>}
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-zinc-200">
              <th className="pb-3 pt-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Description</th>
              <th className="pb-3 pt-2 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100">
              <td className="py-4">
                <p className="font-semibold text-zinc-900">{description}</p>
                <p className="text-sm text-zinc-500">Invoice amount</p>
              </td>
              <td className="py-4 text-right font-semibold text-zinc-900">
                ₹{amountInr.toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 pt-6 border-t-2 border-zinc-200 flex justify-end">
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-500">Total</p>
            <p className="text-3xl font-bold text-[var(--accent)] print:text-teal-600">₹{amountInr.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-zinc-100 text-center text-xs text-zinc-500 print:mt-10">
          Thank you for your business. This is a computer-generated invoice.
        </footer>
      </div>
    </article>
  );
}
