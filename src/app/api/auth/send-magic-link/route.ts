import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db";
import MagicLinkToken from "@/models/MagicLinkToken";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = body.email;
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  await connectDB();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await MagicLinkToken.create({ email: email.toLowerCase().trim(), token, expiresAt });

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const next = (body.next as string) || new URL(request.url).searchParams.get("next") || "/dashboard";
  const signInUrl = `${base}/login/verify?token=${token}&next=${encodeURIComponent(next)}`;

  // TODO: send email via Resend. For dev, you can log the link:
  if (process.env.NODE_ENV === "development") {
    console.log("[Magic link]", signInUrl);
  }

  return NextResponse.json({
    ok: true,
    message: "Check your email for the magic link to sign in.",
    ...(process.env.NODE_ENV === "development" && { devLink: signInUrl }),
  });
}
