const DEFAULT_MODEL = "gemini-2.0-flash-lite";

const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"] as const;

const RETRY_DELAYS_MS = [200, 500] as const;

export function getGeminiModelCandidates(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  return [...new Set([primary, ...FALLBACK_MODELS])];
}

export function isRetryableGeminiError(status: number, message: string): boolean {
  if (status === 429 || status === 503 || status === 500 || status === 502) return true;

  const lower = message.toLowerCase();
  return (
    lower.includes("high demand") ||
    lower.includes("resource exhausted") ||
    lower.includes("overloaded") ||
    lower.includes("unavailable") ||
    lower.includes("rate limit") ||
    lower.includes("try again later") ||
    lower.includes("deadline exceeded")
  );
}

export function isRetryableGeminiMessage(message: string): boolean {
  return isRetryableGeminiError(0, message);
}

export function toFriendlyChatError(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes("chat_not_configured")) {
    return "Annita isn't wired up yet on the server.";
  }

  if (
    lower.includes("high demand") ||
    lower.includes("resource exhausted") ||
    lower.includes("overloaded") ||
    lower.includes("unavailable")
  ) {
    return "Annita's getting a lot of love right now — give her a few seconds and try again, honey.";
  }

  if (lower.includes("rate limit") || lower.includes("quota exceeded") || lower.includes("exceeded your current quota")) {
    return "Annita's hit her API limit for now, honey — try again in a few minutes, or ask Jarod to enable billing on the Google AI key.";
  }

  if (lower.includes("empty response")) {
    return "Annita drew a blank on that one — try asking again or rephrase your question.";
  }

  if (lower.includes("too many form update")) {
    return raw;
  }

  if (raw.length > 100 || /^[A-Z0-9\s.!?,'"-]+$/.test(raw.trim())) {
    return "Something went sideways — please try again in a moment.";
  }

  return raw;
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withGeminiRetries<T>(
  label: string,
  run: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const canRetry = attempt < RETRY_DELAYS_MS.length && shouldRetry(error);
      if (!canRetry) break;
      console.warn(`[chat/gemini] ${label} retry ${attempt + 1}`);
      await sleep(RETRY_DELAYS_MS[attempt]!);
    }
  }

  throw lastError;
}
