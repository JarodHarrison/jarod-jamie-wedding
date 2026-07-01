import {
  adventureAttractions,
  doAttractions,
  eatAttractions,
  oddityAttractions,
  type Attraction,
} from "@/components/wedding/data/attractions";
import { attractionCoordinates } from "@/lib/attraction-coordinates";
import { buildMapsDirectionsUrl } from "@/lib/maps-directions";

export const MAX_DRIVE_MINUTES_FROM_MONTVILLE = 35;

export type HinterlandPlace = Attraction & {
  driveMinutes: number;
};

const ALL_ATTRACTIONS: Attraction[] = [
  ...eatAttractions,
  ...doAttractions,
  ...adventureAttractions,
  ...oddityAttractions,
];

export function parseDriveMinutes(distance: string): number {
  const match = distance.match(/(\d+)\s*min/i);
  return match ? Number(match[1]) : 999;
}

export function enrichPlaceFromAttraction(attraction: Attraction): HinterlandPlace {
  return {
    ...attraction,
    driveMinutes: parseDriveMinutes(attraction.distance),
  };
}

const ALL_PLACES = ALL_ATTRACTIONS.map(enrichPlaceFromAttraction);

/** Curated spots within ~35 minutes of Spicers Clovelly Estate — Annita's fast local index. */
export const HINTERLAND_PLACES_WITHIN_35_MIN = ALL_PLACES.filter(
  (place) => place.driveMinutes <= MAX_DRIVE_MINUTES_FROM_MONTVILLE,
);

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
    titles: ["Maleny Cheese", "Maleny Dairies"],
  },
  {
    pattern: /\b(shop|shopping|gift|boutique|gallery)\b/i,
    titles: ["Montville Artisan Village", "Clock Shop", "Opals Down Under"],
  },
  {
    pattern: /\b(waterfall|walk|hike|nature|rainforest)\b/i,
    titles: ["Kondalilla National Park", "Mapleton Falls", "Mary Cairncross Reserve"],
  },
];

export function scorePlace(place: HinterlandPlace, query: string): number {
  const haystack = `${place.title} ${place.category} ${place.desc}`.toLowerCase();
  let score = 0;

  for (const word of query.toLowerCase().split(/[^a-z0-9]+/)) {
    if (word.length < 3) continue;
    if (haystack.includes(word)) score += 2;
  }

  for (const boost of TOPIC_BOOSTS) {
    if (!boost.pattern.test(query)) continue;
    if (boost.titles.includes(place.title)) score += 8;
  }

  if (/\bmontville\b/i.test(query) && /montville/i.test(place.title + place.desc)) {
    score += 3;
  }
  if (/\bmaleny\b/i.test(query) && /maleny/i.test(place.title + place.desc)) {
    score += 3;
  }

  return score;
}

export function driveMinutesLabel(minutes: number): string {
  if (minutes === 0) return "on-site";
  return `~${minutes} minutes`;
}

export function formatPlaceWebsiteLink(websiteUrl: string | undefined): string {
  if (!websiteUrl) return "";
  return ` [Website](${websiteUrl})`;
}

export function formatPlaceNavigateLink(args: {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  const url = buildMapsDirectionsUrl(args);
  return ` [Navigate](${url})`;
}

export function formatPlaceChatLinks(args: {
  name: string;
  websiteUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  return `${formatPlaceWebsiteLink(args.websiteUrl)}${formatPlaceNavigateLink(args)}`;
}

/** Chat line with a clickable website link (not a raw URL Annita would read aloud). */
export function formatPlaceForChat(place: HinterlandPlace): string {
  const coords = attractionCoordinates(place.title);
  return `• **${place.title}** (${place.category}, ${driveMinutesLabel(place.driveMinutes)}): ${place.desc}${formatPlaceChatLinks({
    name: place.title,
    websiteUrl: place.websiteUrl,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  })}`;
}

export function searchHinterlandPlaces(
  query: string,
  options?: { maxMinutes?: number; limit?: number },
): HinterlandPlace[] {
  const maxMinutes = options?.maxMinutes ?? MAX_DRIVE_MINUTES_FROM_MONTVILLE;
  const limit = options?.limit ?? 4;
  const pool = ALL_PLACES.filter((place) => place.driveMinutes <= maxMinutes);

  return pool
    .map((place) => ({ place, score: scorePlace(place, query) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.place.driveMinutes - b.place.driveMinutes)
    .slice(0, limit)
    .map((row) => row.place);
}

export function buildHinterlandPlacesKnowledge(maxMinutes = MAX_DRIVE_MINUTES_FROM_MONTVILLE): string {
  const pool = ALL_PLACES.filter((place) => place.driveMinutes <= maxMinutes);
  const sections = [
    { heading: "Eat & Drink", items: pool.filter((p) => eatAttractions.some((e) => e.title === p.title)) },
    { heading: "Things to Do", items: pool.filter((p) => doAttractions.some((e) => e.title === p.title)) },
    {
      heading: "Adventure",
      items: pool.filter((p) => adventureAttractions.some((e) => e.title === p.title)),
    },
    {
      heading: "Oddities & Hidden Gems",
      items: pool.filter((p) => oddityAttractions.some((e) => e.title === p.title)),
    },
  ];

  return sections
    .filter((section) => section.items.length > 0)
    .map(
      (section) =>
        `### ${section.heading}\n${section.items.map((place) => formatPlaceForChat(place).replace(/^•\s*/, "- ")).join("\n")}`,
    )
    .join("\n\n");
}

export const LOCAL_DISCOVERY_AREA =
  "Montville, Maleny, Mapleton, Palmwoods, and the Sunshine Coast hinterland (within ~35 minutes of Spicers Clovelly Estate)";
