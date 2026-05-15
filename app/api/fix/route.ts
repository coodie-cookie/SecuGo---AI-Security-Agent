import { geminiModel } from "@/lib/gemini";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, severity, description, codeSnippet, file } = await req.json();

    const prompt = `A developer has this security vulnerability in their code:

Title: ${title}
Severity: ${severity}
File: ${file}
Issue: ${description}
${codeSnippet ? `\nVulnerable code:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ""}

Provide:
1. A fixed version of the code (if a snippet was provided). Output ONLY the fixed code, no explanation around it, inside a code block.
2. In 1-2 sentences after the code block: the single most important thing they must also do outside the code (e.g., rotate a key, update a config, run a command).

Keep it short and practical.`;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    return Response.json({ fix: text });
  } catch (err: any) {
    console.error("Gemini fix error:", err);
    return Response.json(
      { error: err.message ?? "Failed to generate fix" },
      { status: 500 }
    );
  }
}
