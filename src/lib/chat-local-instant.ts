import type { ChatMessage } from "@/lib/chat";
import { isLocalDiscoveryQuestion } from "@/lib/chat-discovery";
import { recentUserText } from "@/lib/chat-intents";
import { localDiscoveryFallbackReply } from "@/lib/chat-sanitize";
import { formatPlaceForChat, searchHinterlandPlaces } from "@/lib/hinterland-places";

export function matchLocalDiscoveryInstant(messages: ChatMessage[]): string | null {
  if (!isLocalDiscoveryQuestion(messages)) return null;

  const query = recentUserText(messages);
  if (!query || query.length > 280) return null;

  const picks = searchHinterlandPlaces(query, { limit: 4 });

  if (picks.length === 0) {
    return localDiscoveryFallbackReply();
  }

  const opener =
    /\b(chocolate|artisanal|fudge)\b/i.test(query)
      ? "For artisanal treats and chocolate vibes near Montville, honey, I'd start here:"
      : "For that hinterland craving, darling, these are my top picks within about 35 minutes of the estate:";

  return `${opener}

${picks.map(formatPlaceForChat).join("\n")}

Ubers are scarce up the range — book transport if you're heading out for dinner. More ideas live in **Guide → Explore Montville** in the app.`;
}
