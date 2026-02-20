import Groq from "groq-sdk";

const defaultModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function getClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey: key });
}

export type ProposalBrief = {
  clientName: string;
  clientCompany?: string;
  projectName?: string;
  scope: string;
  deliverables: string;
  timeline: string;
  amountInr: string;
};

export async function generateProposalWithGroq(brief: ProposalBrief): Promise<string> {
  const client = getClient();
  const projectLine = brief.projectName ? `Project: ${brief.projectName}\n\n` : "";
  const prompt = `You are a professional proposal writer for Indian freelancers and small agencies. Write a clear, professional proposal document based on the following brief. Use a formal but friendly tone. Output only the proposal body (no meta-commentary). Format with clear sections: SCOPE, DELIVERABLES, TIMELINE, INVESTMENT. Use ₹ for currency.

Client: ${brief.clientName}${brief.clientCompany ? ` (${brief.clientCompany})` : ""}
${projectLine}Scope of work: ${brief.scope || "[Not specified]"}

Deliverables: ${brief.deliverables || "[Not specified]"}

Timeline: ${brief.timeline || "[Not specified]"}

Investment: ₹${brief.amountInr ? Number(brief.amountInr).toLocaleString("en-IN") : "[Amount]"}`;

  const completion = await client.chat.completions.create({
    model: defaultModel,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
    temperature: 0.6,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from Groq");
  return content;
}

/** Parse a free-form client message into project name + checklist (for Telegram task creation). */
export type ParsedProjectMessage = {
  name: string;
  checklist: { title: string; value?: string; done?: boolean }[];
};

export async function parseProjectMessageWithGroq(
  rawMessage: string,
  templateChecklistTitles?: string[]
): Promise<ParsedProjectMessage | null> {
  const client = getClient();
  const templateHint =
    templateChecklistTitles && templateChecklistTitles.length > 0
      ? `Prefer these checklist titles and fill "value" from the message: ${templateChecklistTitles.join(", ")}.`
      : "Use checklist titles like: Flight, Date, Time, Price, Airline, Location, etc. and set \"value\" from what the user said.";

  const prompt = `Parse this client task message into JSON.

RULES:
- "name": ONE short title only (e.g. "Flight Dubai to India" or "Hotel Mumbai 14-18 Mar"). Do NOT copy the full message as name. Max 60 chars.
- "checklist": array of items. Each item: "title" (e.g. Flight, Date, Price, Airline), "value" (exact detail from message, e.g. "Dubai to India", "22nd", "20k", "Air India"), "done": true if user gave that detail else false.
${templateHint}

Reply with ONLY this JSON (no markdown, no \`\`\`, no extra text):
{"name":"Short title here","checklist":[{"title":"Flight","value":"Dubai to India","done":true},{"title":"Date","value":"22","done":true},{"title":"Price","value":"20k","done":true},{"title":"Airline","value":"Air India","done":true}]}

Client message:
"""
${rawMessage.slice(0, 2000)}
"""`;

  try {
    const completion = await client.chat.completions.create({
      model: defaultModel,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0.2,
    });
    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;
    let json = content.replace(/^```json?\s*|\s*```$/g, "").trim();
    const first = json.indexOf("{");
    const last = json.lastIndexOf("}");
    if (first !== -1 && last > first) json = json.slice(first, last + 1);
    const parsed = JSON.parse(json) as ParsedProjectMessage;
    if (!parsed?.name || !Array.isArray(parsed.checklist)) return null;
    parsed.name = String(parsed.name).slice(0, 300);
    parsed.checklist = parsed.checklist
      .filter((i) => i && typeof i.title === "string" && i.title.trim())
      .map((i) => ({
        title: String(i.title).trim().slice(0, 200),
        value: i.value != null ? String(i.value).trim().slice(0, 500) : undefined,
        done: !!i.done,
      }));
    return parsed;
  } catch {
    return null;
  }
}

/** Generic chat completion for AI agent / Ask AI. */
export async function chatWithGroq(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  options?: { model?: string; maxTokens?: number; temperature?: number }
): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: options?.model ?? defaultModel,
    messages,
    max_tokens: options?.maxTokens ?? 1536,
    temperature: options?.temperature ?? 0.5,
  });
  const content = completion.choices[0]?.message?.content?.trim();
  return content ?? "";
}
