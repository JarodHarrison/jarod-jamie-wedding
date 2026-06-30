import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import {
  createChatReplyStream,
  formatChatError,
  generateChatReply,
  type ChatMessage,
} from "@/lib/chat";
import { matchInstantFaq } from "@/lib/chat-faq";
import { matchLocalDiscoveryInstant } from "@/lib/chat-local-instant";
import { wantsFormTools } from "@/lib/chat-intents";
import { guestProfileSelect, serializeGuestProfile } from "@/lib/guest-profile";
import { resolveGuestGeoContext } from "@/lib/guest-geo";
import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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

async function loadGuestGeo(
  session: Extract<Awaited<ReturnType<typeof getSession>>, { type: "guest" }>,
  body: Record<string, unknown>,
  guestTier: string,
) {
  const rawLocation = body.guestLocation;
  const clientLatitude =
    rawLocation &&
    typeof rawLocation === "object" &&
    typeof (rawLocation as { latitude?: unknown }).latitude === "number"
      ? (rawLocation as { latitude: number }).latitude
      : null;
  const clientLongitude =
    rawLocation &&
    typeof rawLocation === "object" &&
    typeof (rawLocation as { longitude?: unknown }).longitude === "number"
      ? (rawLocation as { longitude: number }).longitude
      : null;

  const guest = await prisma.guest.findUnique({
    where: { id: session.id },
    select: { accommodationAddress: true, accommodationName: true },
  });

  return resolveGuestGeoContext({
    clientLatitude,
    clientLongitude,
    accommodationAddress: guest?.accommodationAddress ?? null,
    accommodationName: guest?.accommodationName ?? null,
    guestTier,
  });
}

async function loadGuestContext(
  session: Extract<Awaited<ReturnType<typeof getSession>>, { type: "guest" }>,
  messages: ChatMessage[],
) {
  if (!wantsFormTools(messages)) {
    return {
      guestId: session.id,
      profile: undefined,
    };
  }

  const guest = await prisma.guest.findUnique({
    where: { id: session.id },
    select: guestProfileSelect,
  });

  return {
    guestId: session.id,
    profile: guest ? serializeGuestProfile(guest) : undefined,
  };
}

export async function POST(request: Request) {
  let messages: ChatMessage[] = [];
  try {
    const [session, body] = await Promise.all([getSession(), request.json()]);
    if (!session) return jsonError("Unauthorized", 401);

    messages = sanitizeMessages(body.messages);
    const stream = body.stream === true;

    if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
      return jsonError("Please send a message.", 400);
    }

    let guestId: string | undefined;
    let profile;
    let guestGeo;
    let guestTier = session.type === "guest" ? session.tier : "ADMIN";
    let hasGoldCoastTrip = session.type === "admin";

    if (session.type === "guest") {
      const fresh = await syncGuestSessionFromDb(session);
      if (fresh) guestTier = fresh.tier;

      const [trip, guestContext, geo] = await Promise.all([
        prisma.goldCoastTrip.findUnique({
          where: { guestId: session.id },
          select: { id: true },
        }),
        loadGuestContext(session, messages),
        loadGuestGeo(session, body as Record<string, unknown>, guestTier),
      ]);
      hasGoldCoastTrip = Boolean(trip);
      guestId = guestContext.guestId;
      profile = guestContext.profile;
      guestGeo = geo;
    }

    const context =
      session.type === "guest"
        ? {
            guestName: session.name,
            guestTier,
            hasGoldCoastTrip,
            guestId,
            profile,
            guestGeo,
          }
        : { guestName: session.name, guestTier: "ADMIN" };

    if (stream) {
      return new Response(createChatReplyStream(messages, context), {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const { reply, sources, profileUpdated, profile: updatedProfile } =
      await generateChatReply(messages, context);

    return NextResponse.json({
      reply,
      sources,
      profileUpdated: profileUpdated ?? false,
      profile: updatedProfile ?? profile,
    });
  } catch (error) {
    const instant = messages.length > 0 ? matchInstantFaq(messages) : null;
    if (instant) {
      return NextResponse.json({ reply: instant, sources: [] });
    }
    const localInstant = messages.length > 0 ? matchLocalDiscoveryInstant(messages) : null;
    if (localInstant) {
      return NextResponse.json({ reply: localInstant, sources: [] });
    }
    if (error instanceof Error && error.message === "CHAT_NOT_CONFIGURED") {
      return jsonError(
        "Annita Help isn't ready for her close-up yet — please add GOOGLE_API_KEY to your environment.",
        503,
      );
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[chat]", error);
    return jsonError(formatChatError(error), 500);
  }
}
