import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { AI_AUTHOR, AI_MENTION } from "@/lib/constants";

const RequestSchema = z.object({
  roomId: z.string().uuid(),
  userMessage: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { roomId, userMessage } = parsed.data;

  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from("messages")
    .select("author, content, is_ai, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }

  const conversationHistory =
    messages?.map((m) => `${m.author}: ${m.content}`).join("\n") ?? "";

  const prompt =
    userMessage.replace(new RegExp(`^${AI_MENTION}\\s*`, "i"), "").trim() ||
    "Please summarize the conversation so far.";

  let text: string;
  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are Agora, an AI secretary for a real-time group chat room. Help participants by answering their questions and summarizing conversations. Be concise and friendly.`,
      messages: [
        {
          role: "user",
          content: `Here is the full conversation in the chat room:\n\n${conversationHistory}\n\nUser request: ${prompt}`,
        },
      ],
    });
    text = result.text;
  } catch {
    return Response.json({ error: "AI request failed" }, { status: 502 });
  }

  const { error: insertError } = await supabase.from("messages").insert({
    room_id: roomId,
    author: AI_AUTHOR,
    content: text,
    is_ai: true,
  });

  if (insertError) {
    return Response.json(
      { error: "Failed to save AI response" },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
