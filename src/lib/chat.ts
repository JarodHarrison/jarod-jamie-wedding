import {
  shouldIncludeProfileStatus,
  wantsFormTools,
  wantsInstallGuideHelp,
  wantsPenthouseKnowledge,
} from "@/lib/chat-intents";
import { isLocalDiscoveryQuestion, wantsLocalDiscoverySearch } from "@/lib/chat-discovery";
import { GUEST_FORM_TOOL, executeGuestFormSave } from "@/lib/chat-form-tools";
import {
  isMetaLeakReply,
  localDiscoveryFallbackReply,
  sanitizeChatReply,
} from "@/lib/chat-sanitize";
import {
  getGeminiModelCandidates,
  isRetryableGeminiError,
  isRetryableGeminiMessage,
  sleep,
  toFriendlyChatError,
  withGeminiRetries,
} from "@/lib/gemini-resilience";
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

export type ChatStreamEvent =
  | { type: "token"; text: string }
  | {
      type: "done";
      reply: string;
      sources: ChatSource[];
      profileUpdated?: boolean;
      profile?: SerializedGuestProfile;
    }
  | { type: "error"; message: string };

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
  error?: { message?: string; status?: string };
};

export type ChatContext = {
  guestName?: string;
  guestTier?: string;
  guestId?: string;
  profile?: SerializedGuestProfile;
};

const API_MESSAGE_LIMIT = 12;

class GeminiChatError extends Error {
  constructor(raw: string) {
    super(toFriendlyChatError(raw));
    this.name = "GeminiChatError";
  }
}

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

function getResponseParts(data: GeminiResponse): GeminiPart[] {
  return data.candidates?.[0]?.content?.parts ?? [];
}

function hasFunctionCall(parts: GeminiPart[]): boolean {
  return parts.some((part) => part.functionCall);
}

function isEmptyTextResponse(data: GeminiResponse): boolean {
  const parts = getResponseParts(data);
  if (hasFunctionCall(parts)) return false;

  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason === "SAFETY" || finishReason === "RECITATION") return true;

  return !extractText(parts);
}

function finalizeReply(raw: string, usedWebSearch: boolean): string {
  const cleaned = sanitizeChatReply(raw);
  if (cleaned && !isMetaLeakReply(cleaned)) return cleaned;
  if (usedWebSearch || isLocalDiscoveryContext(cleaned || raw)) {
    return localDiscoveryFallbackReply();
  }
  return cleaned || raw.trim();
}

function isLocalDiscoveryContext(text: string): boolean {
  return /\b(restaurant|montville|maleny|eat|food|attraction)\b/i.test(text);
}

function buildGenerationConfig(useWebSearch: boolean, hasTools: boolean) {
  return {
    temperature: useWebSearch ? 0.55 : 0.7,
    maxOutputTokens: useWebSearch ? 768 : hasTools ? 640 : 512,
  };
}

type ResolvedChatConfig = {
  apiKey: string;
  systemInstruction: string;
  contents: GeminiContent[];
  tools: Record<string, unknown>[] | undefined;
  useWebSearch: boolean;
  guestId?: string;
  profile?: SerializedGuestProfile;
};

function resolveChatConfig(messages: ChatMessage[], context: ChatContext): ResolvedChatConfig {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("CHAT_NOT_CONFIGURED");
  }

  const trimmedMessages = messages.slice(-API_MESSAGE_LIMIT);
  const useWebSearch = wantsLocalDiscoverySearch(trimmedMessages);
  const includeLocalGuide = isLocalDiscoveryQuestion(trimmedMessages);
  const includeInstallGuide = wantsInstallGuideHelp(trimmedMessages);
  const includePenthouse = wantsPenthouseKnowledge(context.guestTier, trimmedMessages);
  const formToolsRequested = Boolean(
    context.guestId && context.profile && !useWebSearch && wantsFormTools(trimmedMessages),
  );

  const profileStatus =
    context.profile && shouldIncludeProfileStatus(trimmedMessages)
      ? buildProfileStatusSummary(context.profile)
      : undefined;

  const systemInstruction = buildChatSystemPrompt({
    guestName: context.guestName,
    guestTier: context.guestTier,
    profileStatus,
    canSaveForms: formToolsRequested,
    useWebSearch,
    includeLocalGuide,
    includeInstallGuide,
    includePenthouse,
  });

  const contents: GeminiContent[] = trimmedMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const tools: Record<string, unknown>[] = [];
  if (useWebSearch) {
    tools.push({ google_search: {} });
  } else if (formToolsRequested) {
    tools.push(GUEST_FORM_TOOL);
  }

  return {
    apiKey,
    systemInstruction,
    contents,
    tools: tools.length ? tools : undefined,
    useWebSearch,
    guestId: context.guestId,
    profile: context.profile,
  };
}

function buildGeminiBody(
  systemInstruction: string,
  contents: GeminiContent[],
  useWebSearch: boolean,
  tools?: Record<string, unknown>[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: buildGenerationConfig(useWebSearch, Boolean(tools?.length)),
  };

  if (tools?.length) {
    body.tools = tools;
  }

  return body;
}

async function postGemini(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
  stream = false,
): Promise<Response> {
  const action = stream ? "streamGenerateContent?alt=sse" : "generateContent";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
}

async function callGeminiOnce(
  apiKey: string,
  model: string,
  systemInstruction: string,
  contents: GeminiContent[],
  options?: { tools?: Record<string, unknown>[]; useWebSearch?: boolean },
): Promise<GeminiResponse> {
  const useWebSearch = options?.useWebSearch ?? false;
  const tools = options?.tools;
  const response = await postGemini(
    apiKey,
    model,
    buildGeminiBody(systemInstruction, contents, useWebSearch, tools),
  );

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    const message = data.error?.message ?? "Failed to get AI response.";
    if (isRetryableGeminiError(response.status, message)) {
      throw new Error(message);
    }
    throw new GeminiChatError(message);
  }

  if (isEmptyTextResponse(data) && !hasFunctionCall(getResponseParts(data))) {
    throw new Error("Empty response from AI.");
  }

  return data;
}

async function callGeminiWithFallback(
  apiKey: string,
  systemInstruction: string,
  contents: GeminiContent[],
  options?: { tools?: Record<string, unknown>[]; useWebSearch?: boolean },
): Promise<{ data: GeminiResponse; model: string }> {
  let lastError = "Failed to get AI response.";
  const [primaryModel] = getGeminiModelCandidates();

  for (const model of getGeminiModelCandidates()) {
    try {
      const data = await withGeminiRetries(
        model,
        () => callGeminiOnce(apiKey, model, systemInstruction, contents, options),
        (error) => error instanceof GeminiChatError ? false : isRetryableGeminiMessage(
            error instanceof Error ? error.message : "",
          ),
      );

      if (model !== primaryModel) {
        console.warn("[chat/gemini] used fallback model", model);
      }

      return { data, model };
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      console.warn("[chat/gemini] model failed", model, lastError);
    }
  }

  throw new GeminiChatError(lastError);
}

async function* streamGeminiOnce(
  apiKey: string,
  model: string,
  systemInstruction: string,
  contents: GeminiContent[],
  useWebSearch: boolean,
): AsyncGenerator<string> {
  const response = await postGemini(
    apiKey,
    model,
    buildGeminiBody(systemInstruction, contents, useWebSearch),
    true,
  );

  if (!response.ok) {
    let message = "Failed to stream AI response.";
    try {
      const data = (await response.json()) as GeminiResponse;
      message = data.error?.message ?? message;
    } catch {
      // ignore parse errors
    }

    if (isRetryableGeminiError(response.status, message)) {
      throw new Error(message);
    }
    throw new GeminiChatError(message);
  }

  if (!response.body) {
    throw new Error("Failed to stream AI response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .find((entry) => entry.startsWith("data: "));
      if (!line) continue;

      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;

      let data: GeminiResponse;
      try {
        data = JSON.parse(payload) as GeminiResponse;
      } catch {
        continue;
      }

      const text = extractText(data.candidates?.[0]?.content?.parts ?? []);
      if (text) yield text;
    }
  }
}

const STREAM_RETRY_DELAYS_MS = [400, 900] as const;

async function* streamGeminiWithFallback(
  apiKey: string,
  systemInstruction: string,
  contents: GeminiContent[],
  useWebSearch: boolean,
): AsyncGenerator<string> {
  let lastError = "Failed to stream AI response.";
  const [primaryModel] = getGeminiModelCandidates();

  for (const model of getGeminiModelCandidates()) {
    for (let attempt = 0; attempt <= STREAM_RETRY_DELAYS_MS.length; attempt++) {
      let yielded = false;
      let rawReply = "";

      try {
        for await (const chunk of streamGeminiOnce(
          apiKey,
          model,
          systemInstruction,
          contents,
          useWebSearch,
        )) {
          yielded = true;
          rawReply += chunk;
          yield chunk;
        }

        if (!rawReply.trim()) {
          throw new Error("Empty response from AI.");
        }

        if (model !== primaryModel) {
          console.warn("[chat/gemini] used fallback model for stream", model);
        }
        return;
      } catch (error) {
        if (yielded) {
          throw error instanceof GeminiChatError
            ? error
            : new GeminiChatError(error instanceof Error ? error.message : lastError);
        }

        lastError = error instanceof Error ? error.message : lastError;
        const retryable =
          attempt < STREAM_RETRY_DELAYS_MS.length &&
          !(error instanceof GeminiChatError) &&
          isRetryableGeminiMessage(lastError);

        if (retryable) {
          console.warn(`[chat/gemini] ${model}:stream retry ${attempt + 1}`);
          await sleep(STREAM_RETRY_DELAYS_MS[attempt]!);
          continue;
        }

        console.warn("[chat/gemini] stream model failed", model, lastError);
        break;
      }
    }
  }

  throw new GeminiChatError(lastError);
}

async function runChatRound(
  apiKey: string,
  systemInstruction: string,
  contents: GeminiContent[],
  tools: Record<string, unknown>[] | undefined,
  useWebSearch: boolean,
): Promise<{ reply: string; sources: ChatSource[]; parts: GeminiPart[]; functionCall?: GeminiPart["functionCall"] }> {
  const { data } = await callGeminiWithFallback(apiKey, systemInstruction, contents, {
    tools,
    useWebSearch,
  });

  const parts = getResponseParts(data);
  const functionCall = parts.find((part) => part.functionCall)?.functionCall;
  const reply = finalizeReply(extractText(parts), useWebSearch);

  return {
    reply,
    sources: extractSources(data),
    parts,
    functionCall,
  };
}

async function runToolLoop(config: ResolvedChatConfig): Promise<ChatReply> {
  const contents = [...config.contents];
  let profileUpdated = false;
  let updatedProfile = config.profile;

  for (let round = 0; round < 3; round++) {
    const roundResult = await runChatRound(
      config.apiKey,
      config.systemInstruction,
      contents,
      config.tools,
      config.useWebSearch,
    );

    const { reply, sources, parts, functionCall } = roundResult;

    if (!functionCall || !config.guestId) {
      if (!reply) {
        throw new GeminiChatError("Empty response from AI.");
      }

      return {
        reply,
        sources,
        profileUpdated: profileUpdated || undefined,
        profile: updatedProfile,
      };
    }

    contents.push({ role: "model", parts });

    const saveResult = await executeGuestFormSave(config.guestId, functionCall.args ?? {});

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

  throw new GeminiChatError("Too many form update steps — please try again.");
}

export function formatChatError(error: unknown): string {
  if (error instanceof Error && error.message === "CHAT_NOT_CONFIGURED") {
    return toFriendlyChatError("CHAT_NOT_CONFIGURED");
  }
  if (error instanceof GeminiChatError) {
    return error.message;
  }
  if (error instanceof Error) {
    return toFriendlyChatError(error.message);
  }
  return toFriendlyChatError("Sorry, I couldn't process that. Please try again.");
}

export async function generateChatReply(
  messages: ChatMessage[],
  context: ChatContext,
): Promise<ChatReply> {
  const config = resolveChatConfig(messages, context);
  return runToolLoop(config);
}

export function createChatReplyStream(
  messages: ChatMessage[],
  context: ChatContext,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  const send = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    event: ChatStreamEvent,
  ) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };

  return new ReadableStream({
    async start(controller) {
      try {
        const config = resolveChatConfig(messages, context);

        if (config.tools?.length) {
          const result = await runToolLoop(config);
          send(controller, {
            type: "done",
            reply: result.reply,
            sources: result.sources,
            profileUpdated: result.profileUpdated,
            profile: result.profile,
          });
          controller.close();
          return;
        }

        let rawReply = "";
        for await (const chunk of streamGeminiWithFallback(
          config.apiKey,
          config.systemInstruction,
          config.contents,
          config.useWebSearch,
        )) {
          rawReply += chunk;
          send(controller, { type: "token", text: chunk });
        }

        const reply = finalizeReply(rawReply, config.useWebSearch);
        if (!reply) {
          throw new GeminiChatError("Empty response from AI.");
        }

        send(controller, {
          type: "done",
          reply,
          sources: [],
        });
        controller.close();
      } catch (error) {
        send(controller, { type: "error", message: formatChatError(error) });
        controller.close();
      }
    },
  });
}
