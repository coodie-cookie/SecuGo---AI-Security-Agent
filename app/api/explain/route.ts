import { geminiModel } from "@/lib/gemini";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, severity, category, file, description, codeSnippet } =
      await req.json();

    const prompt = `A security scanner found this issue in a developer's code:

Title: ${title}
Severity: ${severity}
Category: ${category}
File: ${file}
Description: ${description}
${codeSnippet ? `\nCode snippet:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ""}

In 2-3 sentences, explain:
1. Why this is dangerous in plain English (what could an attacker actually do?)
2. One clear, actionable fix they should do right now

Be direct and friendly. No bullet points, no headers. Just two short paragraphs.`;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    return Response.json({ explanation: text });
  } catch (err: any) {
    console.error("Gemini explain error:", err);
    return Response.json(
      { error: err.message ?? "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
