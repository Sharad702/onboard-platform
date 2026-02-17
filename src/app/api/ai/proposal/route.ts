import { NextResponse } from "next/server";
import { generateProposalWithGroq, type ProposalBrief } from "@/lib/ai/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const brief: ProposalBrief = {
      clientName: body.clientName ?? "",
      clientCompany: body.clientCompany,
      projectName: body.projectName,
      scope: body.scope ?? "",
      deliverables: body.deliverables ?? "",
      timeline: body.timeline ?? "",
      amountInr: body.amountInr ?? "",
    };
    const text = await generateProposalWithGroq(brief);
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI proposal generation failed";
    const status = message.includes("GROQ_API_KEY") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
