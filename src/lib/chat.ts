import { wantsLocalDiscoverySearch } from "@/lib/chat-discovery";
import { GUEST_FORM_TOOL, executeGuestFormSave } from "@/lib/chat-form-tools";
import { buildProfileStatusSummary } from "@/lib/guest-profile-checklist";
import type { SerializedGuestProfile } from "@/lib/guest-profile";
import { buildChatSystemPrompt } from "@/lib/wedding-knowledge";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatSource = {
  title: string;
  url: string;
};

export type ChatReply = {
  reply: string;
  sources: ChatSource[];
  profileUpdated?: boolean;
  profile?: SerializedGuestProfile;
};

type GeminiPart = {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
};

type GeminiContent = {
  role: string;
  parts: GeminiPart[];
};

type GroundingChunk = {
  web?: { uri?: string; title?: string };
};

type GeminiResponse = {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
    groundingMetadata?: {
      groundingChunks?: GroundingChunk[];
    };
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export type ChatContext = {
  guestName?: string;
  guestTier?: string;
  guestId?: string;
  profile?: SerializedGuestProfile;
};

function extractSources(data: GeminiResponse): ChatSource[] {
  const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: ChatSource[] = [];

  for (const chunk of chunks) {
    const uri = chunk.web?.uri?.trim();
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({
      title: chunk.web?.title?.trim() || "Source",
      url: uri,
    });
  }

  return sources.slice(0, 5);
}

function extractText(parts: GeminiPart[]): string {
  return parts
    .map((part) => part.text?.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function callGemini(
  apiKey: string,
  model: string,
  systemInstruction: string,
  contents: GeminiContent[],
  tools?: Record<string, unknown>[],
): Promise<GeminiResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body: Record<string, unknown> = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: tools?.some((t) => "google_search" in t) ? 900 : 700,
    },
  };

  if (tools?.length) {
    body.tools = tools;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Failed to get AI response.");
  }

  return data;
}

export async function generateChatReply(
  messages: ChatMessage[],
  context: ChatContext,
): Promise<ChatReply> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("CHAT_NOT_CONFIGURED");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
  const useWebSearch = wantsLocalDiscoverySearch(messages);
  const useFormTools = Boolean(context.guestId && context.profile && !useWebSearch);

  const profileStatus = context.profile ? buildProfileStatusSummary(context.profile) : undefined;

  const systemInstruction = buildChatSystemPrompt({
    guestName: context.guestName,
    guestTier: context.guestTier,
    profileStatus,
    canSaveForms: useFormTools,
  });

  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const tools: Record<string, unknown>[] = [];
  if (useWebSearch) {
    tools.push({ google_search: {} });
  } else if (useFormTools) {
    tools.push(GUEST_FORM_TOOL);
  }

  let profileUpdated = false;
  let updatedProfile = context.profile;

  for (let round = 0; round < 3; round++) {
    const data = await callGemini(
      apiKey,
      model,
      systemInstruction,
      contents,
      tools.length ? tools : undefined,
    );

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const functionCall = parts.find((part) => part.functionCall)?.functionCall;

    if (!functionCall || !context.guestId) {
      const reply = extractText(parts);
      if (!reply) {
        const blocked = data.promptFeedback?.blockReason;
        if (blocked) throw new Error(`Response blocked: ${blocked}`);
        throw new Error("Empty response from AI.");
      }

      return {
        reply,
        sources: extractSources(data),
        profileUpdated: profileUpdated || undefined,
        profile: updatedProfile,
      };
    }

    contents.push({ role: "model", parts });

    const saveResult = await executeGuestFormSave(context.guestId, functionCall.args ?? {});

    if (saveResult.profile) {
      profileUpdated = true;
      updatedProfile = saveResult.profile;
    }

    contents.push({
      role: "user",
      parts: [
        {
          functionResponse: {
            name: functionCall.name,
            response: {
              success: saveResult.success,
              message: saveResult.message,
            },
          },
        },
      ],
    });
  }

  throw new Error("Too many form update steps — please try again.");
}
