import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Invoice from "@/models/Invoice";
import { canAccessClient } from "@/lib/auth-helpers";

const UPLOAD_DIR = "public/uploads";
const INVOICE_SUBDIR = "invoices";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const clientId = formData.get("clientId") as string | null;
  const file = formData.get("image") as File | null;
  if (!clientId || !file || typeof file === "string") {
    return NextResponse.json({ error: "clientId and image file required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only images allowed (JPEG, PNG, WebP, GIF)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  await connectDB();
  const client = await Client.findById(clientId).lean();
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  const can = await canAccessClient(session.user.id, client);
  if (!can) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const description = (formData.get("description") as string | null)?.trim() || "Uploaded invoice";
  const amountStr = formData.get("amountInr") as string | null;
  const amountInr = amountStr !== null && amountStr !== "" ? Number(amountStr) : 0;
  const dueDateStr = formData.get("dueDate") as string | null;
  const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const safeName = sanitizeFileName(file.name || "invoice");
  const ext = path.extname(safeName) || ".jpg";
  const baseName = path.basename(safeName, ext);
  const fileName = `${unique}-${baseName}${ext}`;
  const dir = path.join(process.cwd(), UPLOAD_DIR, clientId, INVOICE_SUBDIR);

  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  const filePath = path.join(dir, fileName);
  await writeFile(filePath, Buffer.from(bytes));

  const imagePath = `/uploads/${clientId}/${INVOICE_SUBDIR}/${fileName}`;
  const invoice = await Invoice.create({
    clientId,
    description,
    amountInr,
    dueDate,
    status: "pending",
    imagePath,
  });

  return NextResponse.json({ id: invoice._id.toString() });
}
