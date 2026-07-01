import type { GuestGeoContext } from "@/lib/guest-geo";
import { SPICERS_CLOVELLY_COORDINATES } from "@/lib/guest-geo";
import {
  ANNITA_EAT_CLOSERS,
  ANNITA_EAT_OPENERS_GPS,
  ANNITA_EAT_OPENERS_SPICERS,
  ANNITA_EAT_OPENERS_STAY,
  fillAnnitaLine,
  pickAnnitaLine,
} from "@/lib/annita";
import { hasFoodCravingIntent } from "@/lib/eatery-cuisine";
import { searchEateries, type ScoredEatery } from "@/lib/eatery-store";
import { formatPlaceChatLinks } from "@/lib/hinterland-places";

const EAT_PATTERNS = [
  /\b(eat|eating|food|restaurant|restaurants|café|cafe|coffee|brunch|breakfast|lunch|dinner|dining|drink|drinks|bar|pub|brewery|winery|hungry|meal|meals|takeaway|take away)\b/i,
  /\bwhere (can|should|to|do i) (i )?(eat|drink|dine|grab food|get food)\b/i,
  /\b(good|best|great).*(place|places|spot|spots).*(eat|food|dinner|lunch)\b/i,
  /\b(place|places|spot|spots).*(eat|food|dinner|lunch)\b/i,
  /\b(recommend|suggestion|suggest).*(food|eat|drink|restaurant|dinner|lunch|meal)\b/i,
  /\b(what|any).*(good|nice).*(restaurant|café|cafe|pub|bar|food)\b/i,
  /\b(in the mood|craving|fancy|keen on).*(food|eat|meal|bite)\b/i,
];

export const DEFAULT_EAT_GEO: GuestGeoContext = {
  origin: SPICERS_CLOVELLY_COORDINATES,
  originLabel: "Spicers Clovelly Estate",
  fromGuest: false,
};

const NON_FOOD_ACTIVITY =
  /\b(waterfall|walk|hike|hiking|nature|rainforest|park|reserve|gallery|shop|shopping|market|adventure|zoo|attraction|things to do|activity|activities)\b/i;

export function isEatDiscoveryQuestion(text: string): boolean {
  if (EAT_PATTERNS.some((pattern) => pattern.test(text))) return true;
  if (hasFoodCravingIntent(text)) return true;
  if (
    /\b(nearby|near me|around here|close by|around montville|around maleny)\b/i.test(text) &&
    !NON_FOOD_ACTIVITY.test(text) &&
    /\b(good|great|best|recommend|suggestion|where|places?|spots?|go)\b/i.test(text)
  ) {
    return true;
  }
  return false;
}

function buildEatOpener(geo: GuestGeoContext): string {
  if (!geo.fromGuest) {
    return fillAnnitaLine(pickAnnitaLine(ANNITA_EAT_OPENERS_SPICERS), geo.originLabel);
  }
  if (geo.originLabel === "where you are") {
    return fillAnnitaLine(pickAnnitaLine(ANNITA_EAT_OPENERS_GPS), geo.originLabel);
  }
  return fillAnnitaLine(pickAnnitaLine(ANNITA_EAT_OPENERS_STAY), geo.originLabel);
}

export function formatEatPlaceForChat(place: ScoredEatery, geo: GuestGeoContext): string {
  const distanceLabel =
    place.driveMinutes === 0
      ? "on-site"
      : `~${place.driveMinutes} minutes from ${geo.originLabel}`;

  const cuisineHint =
    place.cuisineTags.length > 0
      ? ` — ${place.cuisineTags.slice(0, 3).join(", ")}`
      : "";

  return `• **${place.name}** (${place.category}${cuisineHint}, ${distanceLabel}) — ${place.description}${formatPlaceChatLinks({
    name: place.name,
    websiteUrl: place.websiteUrl,
    latitude: place.latitude,
    longitude: place.longitude,
  })}`;
}

export async function buildEatDiscoveryReply(query: string, geo: GuestGeoContext): Promise<string> {
  const picks = await searchEateries(query, geo.origin, { limit: 3 });

  return `${buildEatOpener(geo)}

${picks.map((place) => formatEatPlaceForChat(place, geo)).join("\n")}

${pickAnnitaLine(ANNITA_EAT_CLOSERS)}`;
}
