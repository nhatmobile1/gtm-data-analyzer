import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { messages, dataContext } = await req.json();

    if (!messages || !dataContext) {
      return NextResponse.json(
        { error: "Missing messages or dataContext" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a Senior Marketing Operations analyst helping analyze marketing campaign and pipeline data. You have access to a complete data summary below. Answer questions with specific numbers from the data. Be direct, quantitative, and actionable.

When recommending actions, structure them as:
- WHAT'S HAPPENING (cite the specific data)
- WHY IT MATTERS (business impact)
- WHAT TO DO (specific, implementable steps)
- HOW TO MEASURE (KPIs and targets)

Use the data to support every claim. Format responses with clear sections and bullet points.

${dataContext}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const content = response.content
      .map((b) => ("text" in b ? b.text : ""))
      .join("\n");

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI analyze error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
