import type { ChatMessage } from "@/lib/chat";
import { isEatDiscoveryQuestion, buildEatDiscoveryReply } from "@/lib/chat-eat-discovery";
import { isLocalDiscoveryQuestion } from "@/lib/chat-discovery";
import { recentUserText } from "@/lib/chat-intents";
import type { GuestGeoContext } from "@/lib/guest-geo";
import { localDiscoveryFallbackReply } from "@/lib/chat-sanitize";
import { formatPlaceForChat, searchHinterlandPlaces } from "@/lib/hinterland-places";
import { ANNITA_EAT_CLOSERS, ANNITA_LOCAL_OPENERS, fillAnnitaLine, pickAnnitaLine } from "@/lib/annita";

export function matchLocalDiscoveryInstant(
  messages: ChatMessage[],
  geo?: GuestGeoContext,
): string | null {
  if (!isLocalDiscoveryQuestion(messages)) return null;

  const query = recentUserText(messages);
  if (!query || query.length > 280) return null;

  if (geo && isEatDiscoveryQuestion(query)) {
    return buildEatDiscoveryReply(query, geo);
  }

  const picks = searchHinterlandPlaces(query, { limit: 3 });

  if (picks.length === 0) {
    if (geo && isEatDiscoveryQuestion(query)) {
      return buildEatDiscoveryReply(query, geo);
    }
    return localDiscoveryFallbackReply();
  }

  const opener = /\b(chocolate|artisanal|fudge)\b/i.test(query)
    ? pickAnnitaLine(ANNITA_LOCAL_OPENERS.chocolate)
    : geo?.fromGuest
      ? fillAnnitaLine(pickAnnitaLine(ANNITA_LOCAL_OPENERS.fromGuest), geo.originLabel)
      : pickAnnitaLine(ANNITA_LOCAL_OPENERS.spicers);

  return `${opener}

${picks.map(formatPlaceForChat).join("\n")}

${pickAnnitaLine(ANNITA_EAT_CLOSERS)}`;
}
