import { generateText, streamText } from "ai";

/** Free-tier AI Gateway models only — used when direct Gemini is unavailable. */
const DEFAULT_FREE_GATEWAY_MODELS = [
  "google/gemini-2.5-flash",
  "anthropic/claude-haiku-4.5",
] as const;

export function isAnnitaGatewayFallbackEnabled(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim(),
  );
}

export function getAnnitaGatewayFallbackModels(): string[] {
  const configured = process.env.ANNITA_GATEWAY_FALLBACK_MODELS?.trim();
  if (configured) {
    return configured
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean);
  }
  return [...DEFAULT_FREE_GATEWAY_MODELS];
}

export function canUseAnnitaGatewayFallback(options?: {
  useWebSearch?: boolean;
  hasTools?: boolean;
}): boolean {
  if (!isAnnitaGatewayFallbackEnabled()) return false;
  if (options?.useWebSearch || options?.hasTools) return false;
  return true;
}

type SimpleChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function toGatewayMessages(contents: { role: string; parts: { text?: string }[] }[]): SimpleChatMessage[] {
  return contents
    .map((entry) => {
      const text = entry.parts
        .map((part) => part.text?.trim())
        .filter(Boolean)
        .join("\n")
        .trim();
      if (!text) return null;
      return {
        role: entry.role === "model" ? ("assistant" as const) : ("user" as const),
        content: text,
      };
    })
    .filter((entry): entry is SimpleChatMessage => entry !== null);
}

function isRetryableGatewayError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("rate limit") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("503") ||
    message.includes("502") ||
    message.includes("429")
  );
}

export async function generateAnnitaGatewayFallback(
  systemInstruction: string,
  contents: { role: string; parts: { text?: string }[] }[],
): Promise<{ text: string; model: string }> {
  const messages = toGatewayMessages(contents);
  let lastError = "AI Gateway fallback failed.";

  for (const model of getAnnitaGatewayFallbackModels()) {
    try {
      const result = await generateText({
        model,
        system: systemInstruction,
        messages,
      });

      const text = result.text.trim();
      if (!text) {
        throw new Error("Empty response from AI Gateway.");
      }

      console.warn("[chat/gateway] used free-tier fallback model", model);
      return { text, model };
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      if (!isRetryableGatewayError(error)) {
        console.warn("[chat/gateway] model failed (non-retryable)", model, lastError);
        continue;
      }
      console.warn("[chat/gateway] model failed", model, lastError);
    }
  }

  throw new Error(lastError);
}

export async function* streamAnnitaGatewayFallback(
  systemInstruction: string,
  contents: { role: string; parts: { text?: string }[] }[],
): AsyncGenerator<string> {
  const messages = toGatewayMessages(contents);
  let lastError = "AI Gateway fallback failed.";

  for (const model of getAnnitaGatewayFallbackModels()) {
    try {
      const result = streamText({
        model,
        system: systemInstruction,
        messages,
      });

      let rawReply = "";
      for await (const chunk of result.textStream) {
        rawReply += chunk;
        yield chunk;
      }

      if (!rawReply.trim()) {
        throw new Error("Empty response from AI Gateway.");
      }

      console.warn("[chat/gateway] used free-tier fallback model for stream", model);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      console.warn("[chat/gateway] stream model failed", model, lastError);
    }
  }

  throw new Error(lastError);
}
