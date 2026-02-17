import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ClientPortalToken from "@/models/ClientPortalToken";
import Document from "@/models/Document";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  await connectDB();
  const row = await ClientPortalToken.findOne({ token }).select("clientId expiresAt usedAt").lean();
  if (!row || new Date(row.expiresAt) < new Date() || row.usedAt) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const docs = await Document.find({ clientId: row.clientId })
    .select("_id fileName filePath size createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    docs.map((d) => ({
      id: d._id.toString(),
      fileName: d.fileName,
      filePath: d.filePath,
      size: d.size,
      createdAt: d.createdAt,
    }))
  );
}
