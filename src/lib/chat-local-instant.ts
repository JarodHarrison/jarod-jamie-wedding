import type { ChatMessage } from "@/lib/chat";
import { isEatDiscoveryQuestion, buildEatDiscoveryReply } from "@/lib/chat-eat-discovery";
import { isLocalDiscoveryQuestion } from "@/lib/chat-discovery";
import { recentUserText } from "@/lib/chat-intents";
import type { GuestGeoContext } from "@/lib/guest-geo";
import { localDiscoveryFallbackReply } from "@/lib/chat-sanitize";
import { formatPlaceForChat, searchHinterlandPlaces } from "@/lib/hinterland-places";

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
    ? "For artisanal treats and chocolate vibes near Montville, honey, I'd start here:"
    : geo?.fromGuest
      ? `For that hinterland craving, darling — my top picks from **${geo.originLabel}**:`
      : "For that hinterland craving, darling — my top picks from **Spicers Clovelly Estate**:";

  return `${opener}

${picks.map(formatPlaceForChat).join("\n")}

Ubers are scarce up the range — book transport if you're heading out. More ideas in **Guide → Explore Montville**.`;
}
