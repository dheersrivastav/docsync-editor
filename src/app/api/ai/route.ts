import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["grammar", "summarize", "title"]),
  content: z.string().min(1).max(50000),
});

const prompts: Record<string, string> = {
  grammar: "Fix grammar, spelling, and punctuation in the following text. Return only the corrected text with no explanation.",
  summarize: "Write a concise 2-3 sentence summary of the following document content. Return only the summary.",
  title: "Generate a short, clear document title (5 words max) based on the following content. Return only the title, no quotes.",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { action, content } = parsed.data;

  // Strip HTML tags for AI processing
  const plainText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: prompts[action] },
        { role: "user", content: plainText },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const result = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[AI route error]", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
