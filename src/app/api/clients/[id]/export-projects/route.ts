import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Project from "@/models/Project";
import { canAccessClient } from "@/lib/auth-helpers";
import * as XLSX from "xlsx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const client = await Client.findById(id).lean();
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projects = await Project.find({ clientId: id })
    .select("name valueInr updatedAt createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const rows = projects.map((p) => ({
    "Project name": p.name,
    Date: p.updatedAt
      ? new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—",
    Money: p.valueInr != null ? Number(p.valueInr) : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const filename = `projects-${client.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.xlsx`;
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
