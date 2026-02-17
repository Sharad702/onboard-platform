import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { chatWithGroq } from "@/lib/ai/groq";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const clientContext = body.clientContext as { clientName?: string; clientCompany?: string } | undefined;

    if (messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const systemParts = [
      "You are the AI assistant for OnboardEasy — an app for Indian freelancers and small teams to onboard and serve clients. You help with: (1) Client work: proposals, contracts, timelines, pricing (INR), scope, deliverables, onboarding in India. (2) Concierge: when the user is fulfilling a client request (recommendations, research, local info, etc.), answer so the user can serve that client.",
      "Response quality: Be specific and actionable. For recommendations or lists: use clear numbering or bullets, include brief why (e.g. 'known for X', 'good for Y'). For places in India: mention area/location, vibe or specialty, and one-line practical tip if useful. Keep answers well-structured and easy to copy or forward to the client. Avoid vague or generic filler.",
      "Only refuse if the question is clearly unrelated to client work or serving the client.",
    ];
    if (clientContext?.clientName) {
      systemParts.push(`Current context: user is working with client "${clientContext.clientName}"${clientContext.clientCompany ? ` (${clientContext.clientCompany})` : ""}.`);
    }

    const fullMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemParts.join(" ") },
      ...messages.map((m: { role?: string; content?: string }) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: String(m.content ?? ""),
      })),
    ];

    const content = await chatWithGroq(fullMessages, { maxTokens: 1536, temperature: 0.5 });
    return NextResponse.json({ content });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI chat failed";
    const status = message.includes("GROQ_API_KEY") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
