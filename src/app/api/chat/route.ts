import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { generateChatReply, type ChatMessage } from "@/lib/chat";
import { getSession } from "@/lib/auth/session";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (m): m is { role: string; content: string } =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.trim().slice(0, MAX_CONTENT_LENGTH),
    }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_MESSAGES);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = await request.json();
    const messages = sanitizeMessages(body.messages);

    if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
      return jsonError("Please send a message.", 400);
    }

    const context =
      session.type === "guest"
        ? { guestName: session.name, guestTier: session.tier }
        : { guestName: session.name, guestTier: "ADMIN" };

    const reply = await generateChatReply(messages, context);

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Error && error.message === "CHAT_NOT_CONFIGURED") {
      return jsonError(
        "The wedding assistant is not configured yet. Please add GOOGLE_API_KEY to your environment.",
        503,
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[chat]", error);
    return jsonError("Sorry, I couldn't process that. Please try again.", 500);
  }
}
