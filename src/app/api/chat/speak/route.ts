import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { getSession } from "@/lib/auth/session";
import { plainTextForSpeech } from "@/lib/speech/plain-text";
import { getConfiguredTtsProviders, isElevenLabsConfigured, synthesizeAnnitaSpeech } from "@/lib/tts";

export async function GET() {
  return NextResponse.json({
    providers: getConfiguredTtsProviders(),
    distinctVoice: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID),
  });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = await request.json();
    const text = typeof body.text === "string" ? plainTextForSpeech(body.text) : "";
    if (!text) return jsonError("Nothing to speak.", 400);

    const result = await synthesizeAnnitaSpeech(text);
    if (!result) {
      const configured = isElevenLabsConfigured();
      return jsonError(
        configured
          ? "Annita's voice couldn't be generated. Check your ElevenLabs Voice ID and credits."
          : "Server voice not configured — add ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID, then redeploy.",
        503,
      );
    }

    return new NextResponse(new Uint8Array(result.audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
        "X-TTS-Provider": result.provider,
      },
    });
  } catch {
    return jsonError("Could not generate speech.", 500);
  }
}
