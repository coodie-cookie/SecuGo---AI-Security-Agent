import { geminiChat } from "@/lib/gemini";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Build chat history — exclude the last message (current prompt) and
    // drop any leading assistant messages since Gemini requires history
    // to start with a user turn.
    const prior = messages.slice(0, -1);
    const firstUserIdx = prior.findIndex((m: any) => m.role === "user");
    const trimmed = firstUserIdx === -1 ? [] : prior.slice(firstUserIdx);

    const history = trimmed.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = geminiChat.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return Response.json({ reply: text });
  } catch (err: any) {
    console.error("Gemini chat error:", err);
    return Response.json(
      { error: err.message ?? "Failed to get AI response" },
      { status: 500 }
    );
  }
}
