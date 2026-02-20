const TELEGRAM_API = "https://api.telegram.org";

export function getBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "";
}

export async function getMe(token: string): Promise<{ username?: string } | null> {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/getMe`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.ok) return null;
  return data.result ? { username: data.result.username } : null;
}

export async function setWebhook(token: string, webhookSecret: string): Promise<boolean> {
  const base = getBaseUrl();
  if (!base) return false;
  const url = `${base}/api/telegram/webhook`;
  const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, secret_token: webhookSecret }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.ok;
}

/** Team bot webhook: /api/telegram/webhook/[orgId]. Returns ok + optional Telegram error. */
export async function setWebhookWithOrgId(
  token: string,
  orgId: string,
  webhookSecret: string
): Promise<{ ok: boolean; error?: string }> {
  return setWebhookForPath(token, `/api/telegram/webhook/${orgId}`, webhookSecret);
}

/** Client bot webhook: /api/telegram/webhook/[orgId]/client */
export async function setWebhookForClientBot(
  token: string,
  orgId: string,
  webhookSecret: string
): Promise<{ ok: boolean; error?: string }> {
  return setWebhookForPath(token, `/api/telegram/webhook/${orgId}/client`, webhookSecret);
}

async function setWebhookForPath(
  token: string,
  path: string,
  webhookSecret: string
): Promise<{ ok: boolean; error?: string }> {
  const base = getBaseUrl();
  if (!base) return { ok: false, error: "No app URL (set NEXT_PUBLIC_APP_URL or VERCEL_URL)" };
  if (!base.startsWith("https://")) {
    return { ok: false, error: "Telegram requires HTTPS (e.g. http://localhost won't work). For local dev run: npm run telegram:poll" };
  }
  const url = base + path;
  const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, secret_token: webhookSecret }),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.ok) return { ok: true };
  const msg = data?.description ?? (res.ok ? "Unknown error" : `HTTP ${res.status}`);
  return { ok: false, error: msg };
}

export async function deleteWebhook(token: string): Promise<boolean> {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/deleteWebhook`);
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.ok;
}

/** Long polling: get updates (for local dev without webhook). Returns updates and next offset. */
export async function getUpdates(
  token: string,
  offset: number,
  timeoutSeconds = 25
): Promise<{ updates: unknown[]; nextOffset: number }> {
  const res = await fetch(
    `${TELEGRAM_API}/bot${token}/getUpdates?offset=${offset}&timeout=${timeoutSeconds}`
  );
  if (!res.ok) return { updates: [], nextOffset: offset };
  const data = await res.json();
  if (!data.ok || !Array.isArray(data.result)) return { updates: [], nextOffset: offset };
  const updates = data.result as { update_id: number }[];
  const nextOffset = updates.length
    ? Math.max(...updates.map((u) => u.update_id)) + 1
    : offset;
  return { updates: data.result, nextOffset };
}

export async function sendMessage(token: string, chatId: string, text: string): Promise<boolean> {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.ok;
}

export function randomSecret(): string {
  const crypto = require("crypto");
  return crypto.randomBytes(24).toString("base64url");
}
