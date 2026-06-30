import { eatAttractions } from "@/components/wedding/data/attractions";
import { ATTRACTION_COORDINATES } from "@/lib/attraction-coordinates";
import type { GuestGeoContext } from "@/lib/guest-geo";
import { estimateDriveMinutes, SPICERS_CLOVELLY_COORDINATES } from "@/lib/guest-geo";
import {
  ANNITA_EAT_CLOSERS,
  ANNITA_EAT_OPENERS_GPS,
  ANNITA_EAT_OPENERS_SPICERS,
  ANNITA_EAT_OPENERS_STAY,
  fillAnnitaLine,
  pickAnnitaLine,
} from "@/lib/annita";
import {
  enrichPlaceFromAttraction,
  formatPlaceWebsiteLink,
  scorePlace,
  type HinterlandPlace,
} from "@/lib/hinterland-places";

const EAT_PATTERNS = [
  /\b(eat|eating|food|restaurant|restaurants|café|cafe|coffee|brunch|breakfast|lunch|dinner|dining|drink|drinks|bar|pub|brewery|winery|hungry|meal|meals)\b/i,
  /\bwhere (can|should|to|do i) (i )?(eat|drink|dine|grab food|get food)\b/i,
  /\b(good|best|great).*(place|places|spot|spots).*(eat|food|dinner|lunch)\b/i,
  /\b(place|places|spot|spots).*(eat|food|dinner|lunch)\b/i,
];

const DEFAULT_EAT_PICKS = ["The Long Apron", "Flame Hill Vineyard", "Brouhaha Brewery"];

export function isEatDiscoveryQuestion(text: string): boolean {
  return EAT_PATTERNS.some((pattern) => pattern.test(text));
}

function eatPool(): HinterlandPlace[] {
  return eatAttractions.map((attraction) => enrichPlaceFromAttraction(attraction));
}

export function searchEatPlaces(query: string, limit = 3): HinterlandPlace[] {
  const pool = eatPool();
  const ranked = pool
    .map((place) => ({ place, score: scorePlace(place, query) }))
    .sort((a, b) => b.score - a.score || a.place.driveMinutes - b.place.driveMinutes);

  const scored = ranked.filter((row) => row.score > 0).map((row) => row.place);
  if (scored.length >= limit) return scored.slice(0, limit);

  const seen = new Set(scored.map((place) => place.title));
  for (const title of DEFAULT_EAT_PICKS) {
    if (scored.length >= limit) break;
    const place = pool.find((item) => item.title === title);
    if (place && !seen.has(place.title)) {
      scored.push(place);
      seen.add(place.title);
    }
  }

  for (const row of ranked) {
    if (scored.length >= limit) break;
    if (!seen.has(row.place.title)) {
      scored.push(row.place);
      seen.add(row.place.title);
    }
  }

  return scored.slice(0, limit);
}

function driveMinutesFromOrigin(place: HinterlandPlace, geo: GuestGeoContext): number {
  const coords = ATTRACTION_COORDINATES[place.title];
  if (!coords) return place.driveMinutes;

  const origin = geo.fromGuest ? geo.origin : SPICERS_CLOVELLY_COORDINATES;
  return estimateDriveMinutes(origin, coords);
}

export function formatEatPlaceForChat(place: HinterlandPlace, geo: GuestGeoContext): string {
  const minutes = driveMinutesFromOrigin(place, geo);
  const distanceLabel =
    minutes === 0
      ? "on-site"
      : `~${minutes} minutes from ${geo.originLabel}`;

  return `• **${place.title}** (${place.category}, ${distanceLabel}) — ${place.desc}${formatPlaceWebsiteLink(place.websiteUrl)}`;
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

export function buildEatDiscoveryReply(query: string, geo: GuestGeoContext): string {
  const picks = searchEatPlaces(query, 3);

  return `${buildEatOpener(geo)}

${picks.map((place) => formatEatPlaceForChat(place, geo)).join("\n")}

${pickAnnitaLine(ANNITA_EAT_CLOSERS)}`;
}
