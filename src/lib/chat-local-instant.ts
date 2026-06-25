import type { ChatMessage } from "@/lib/chat";
import { isLocalDiscoveryQuestion } from "@/lib/chat-discovery";
import { recentUserText } from "@/lib/chat-intents";
import {
  adventureAttractions,
  doAttractions,
  eatAttractions,
  oddityAttractions,
  type Attraction,
} from "@/components/wedding/data/attractions";
import { localDiscoveryFallbackReply } from "@/lib/chat-sanitize";

const ALL_ATTRACTIONS: Attraction[] = [
  ...eatAttractions,
  ...doAttractions,
  ...adventureAttractions,
  ...oddityAttractions,
];

const TOPIC_BOOSTS: Array<{ pattern: RegExp; titles: string[] }> = [
  {
    pattern: /\b(chocolate|artisanal|fudge|confectionery|sweets?|cocoa)\b/i,
    titles: ["Montville Artisan Village", "Nutworks", "The Ginger Factory", "Tiffany's Maleny"],
  },
  {
    pattern: /\b(coffee|café|cafe)\b/i,
    titles: ["Secrets on the Lake", "Montville Artisan Village", "Maleny Lane"],
  },
  {
    pattern: /\b(beer|brewery|wine|winery)\b/i,
    titles: ["Brouhaha Brewery", "Flame Hill Vineyard"],
  },
  {
    pattern: /\b(cheese|dairy)\b/i,
    titles: ["Maleny Cheese"],
  },
  {
    pattern: /\b(shop|shopping|gift|boutique|gallery)\b/i,
    titles: ["Montville Artisan Village", "Clock Shop", "Opals Down Under"],
  },
];

function scoreAttraction(attraction: Attraction, query: string): number {
  const haystack = `${attraction.title} ${attraction.category} ${attraction.desc}`.toLowerCase();
  let score = 0;

  for (const word of query.toLowerCase().split(/[^a-z0-9]+/)) {
    if (word.length < 3) continue;
    if (haystack.includes(word)) score += 2;
  }

  for (const boost of TOPIC_BOOSTS) {
    if (!boost.pattern.test(query)) continue;
    if (boost.titles.includes(attraction.title)) score += 8;
  }

  if (/\bmontville\b/i.test(query) && /montville/i.test(attraction.title + attraction.desc)) {
    score += 3;
  }
  if (/\bmaleny\b/i.test(query) && /maleny/i.test(attraction.title + attraction.desc)) {
    score += 3;
  }

  return score;
}

function formatPick(attraction: Attraction): string {
  const link = attraction.websiteUrl ? ` — ${attraction.websiteUrl}` : "";
  return `• **${attraction.title}** (${attraction.category}, ~${attraction.distance}): ${attraction.desc}${link}`;
}

export function matchLocalDiscoveryInstant(messages: ChatMessage[]): string | null {
  if (!isLocalDiscoveryQuestion(messages)) return null;

  const query = recentUserText(messages);
  if (!query || query.length > 280) return null;

  const ranked = ALL_ATTRACTIONS.map((attraction) => ({
    attraction,
    score: scoreAttraction(attraction, query),
  }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return localDiscoveryFallbackReply();
  }

  const picks = ranked.slice(0, 4).map((row) => formatPick(row.attraction));
  const opener =
    /\b(chocolate|artisanal|fudge)\b/i.test(query)
      ? "For artisanal treats and chocolate vibes near Montville, honey, I'd start here:"
      : "For that hinterland craving, darling, these are my top picks from our curated guide:";

  return `${opener}

${picks.join("\n")}

Ubers are scarce up the range — book transport if you're heading out for dinner. More ideas live in **Guide → Explore Montville** in the app.`;
}
