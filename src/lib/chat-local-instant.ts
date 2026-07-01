import type { ChatMessage } from "@/lib/chat";
import {
  buildEatDiscoveryReply,
  DEFAULT_EAT_GEO,
  isEatDiscoveryQuestion,
} from "@/lib/chat-eat-discovery";
import { isLocalDiscoveryQuestion } from "@/lib/chat-discovery";
import { recentUserText } from "@/lib/chat-intents";
import type { GuestGeoContext } from "@/lib/guest-geo";
import { localDiscoveryFallbackReply } from "@/lib/chat-sanitize";
import { formatCachedAttractionForChat } from "@/lib/chat-attraction-discovery";
import { searchAttractions } from "@/lib/attraction-store";
import { ANNITA_LOCAL_CLOSERS, ANNITA_LOCAL_OPENERS, fillAnnitaLine, pickAnnitaLine } from "@/lib/annita";

export async function matchLocalDiscoveryInstant(
  messages: ChatMessage[],
  geo?: GuestGeoContext,
): Promise<string | null> {
  if (!isLocalDiscoveryQuestion(messages)) return null;

  const query = recentUserText(messages);
  if (!query || query.length > 280) return null;

  const geoCtx = geo ?? DEFAULT_EAT_GEO;

  if (isEatDiscoveryQuestion(query)) {
    return buildEatDiscoveryReply(query, geoCtx);
  }

  const picks = await searchAttractions(query, geoCtx.origin, { limit: 3 });

  if (picks.length === 0) {
    return localDiscoveryFallbackReply();
  }

  const opener = /\b(chocolate|artisanal|fudge)\b/i.test(query)
    ? pickAnnitaLine(ANNITA_LOCAL_OPENERS.chocolate)
    : geoCtx.fromGuest
      ? fillAnnitaLine(pickAnnitaLine(ANNITA_LOCAL_OPENERS.fromGuest), geoCtx.originLabel)
      : pickAnnitaLine(ANNITA_LOCAL_OPENERS.spicers);

  return `${opener}

${picks.map((place) => formatCachedAttractionForChat(place, geoCtx)).join("\n")}

${pickAnnitaLine(ANNITA_LOCAL_CLOSERS)}`;
}
