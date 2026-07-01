import {
  adventureAttractions,
  doAttractions,
  oddityAttractions,
} from "@/components/wedding/data/attractions";
import { attractionCoordinates } from "@/lib/attraction-coordinates";
import { inferTopicTags } from "@/lib/attraction-topics";
import type { GeoPoint } from "@/lib/guest-geo";

export type AttractionRecord = {
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  topicTags: string[];
  description: string;
  websiteUrl?: string;
  address?: string;
  googlePlaceId?: string;
  rating?: number;
  reviewCount?: number;
};

export const ATTRACTION_RADIUS_KM = 35;

export const DEFAULT_ATTRACTION_PICKS = [
  "Kondalilla National Park",
  "Mary Cairncross Reserve",
  "Montville Artisan Village",
];

const CURATED_ATTRACTIONS = [...doAttractions, ...adventureAttractions, ...oddityAttractions];

function toRecord(
  attraction: (typeof CURATED_ATTRACTIONS)[number],
  rating = 4.6,
  reviewCount = 120,
): AttractionRecord | null {
  const coords = attractionCoordinates(attraction.title);
  if (!coords) return null;

  return {
    name: attraction.title,
    latitude: coords.latitude,
    longitude: coords.longitude,
    category: attraction.category,
    topicTags: inferTopicTags(attraction),
    description: attraction.desc,
    websiteUrl: attraction.websiteUrl,
    rating,
    reviewCount,
  };
}

export const SEED_ATTRACTIONS: AttractionRecord[] = CURATED_ATTRACTIONS.map((item) => toRecord(item)).filter(
  (item): item is AttractionRecord => item !== null,
);

export function attractionToGeo(attraction: Pick<AttractionRecord, "latitude" | "longitude">): GeoPoint {
  return { latitude: attraction.latitude, longitude: attraction.longitude };
}
