import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { connectDB } from "@/lib/db";
import ClientPortalToken from "@/models/ClientPortalToken";
import Document from "@/models/Document";

const UPLOAD_DIR = "public/uploads";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const token = formData.get("token") as string | null;
  const file = formData.get("file") as File | null;
  if (!token || !file || typeof file === "string") {
    return NextResponse.json({ error: "token and file required" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  await connectDB();
  const row = await ClientPortalToken.findOne({ token }).select("clientId expiresAt usedAt").lean();
  if (!row || new Date(row.expiresAt) < new Date() || row.usedAt) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const clientId = row.clientId.toString();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const safeName = sanitizeFileName(file.name || "document");
  const fileName = `${unique}-${safeName}`;
  const dir = path.join(process.cwd(), UPLOAD_DIR, clientId);

  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  const filePath = path.join(dir, fileName);
  await writeFile(filePath, Buffer.from(bytes));

  const filePathUrl = `/uploads/${clientId}/${fileName}`;
  const doc = await Document.create({
    clientId: row.clientId,
    fileName: file.name || fileName,
    filePath: filePathUrl,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    uploadedBy: "client",
  });

  return NextResponse.json({
    id: doc._id.toString(),
    fileName: doc.fileName,
    filePath: doc.filePath,
  });
}
