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
