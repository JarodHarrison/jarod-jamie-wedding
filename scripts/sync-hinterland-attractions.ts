/**
 * Sync top-rated attractions within 35km of Spicers from Google Places.
 * Run: npm run db:sync-attractions
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

import { prisma } from "../src/lib/prisma";
import { inferTopicTags } from "../src/lib/attraction-topics";
import { SEED_ATTRACTIONS, type AttractionRecord } from "../src/lib/attraction-seed";
import { upsertAttractionBatch, invalidateAttractionCache } from "../src/lib/attraction-store";
import { googleMapsServerApiKey } from "../src/lib/google-maps-api-key";
import { SPICERS_CLOVELLY_COORDINATES } from "../src/lib/guest-geo";

const RADIUS_M = 35_000;
const MIN_RATING = 4.0;
const MIN_REVIEWS = 15;
const PLACE_TYPES = [
  "tourist_attraction",
  "park",
  "museum",
  "art_gallery",
  "zoo",
  "amusement_park",
] as const;

const EXCLUDED_TYPES = new Set([
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "meal_takeaway",
  "night_club",
  "liquor_store",
  "gas_station",
  "lodging",
]);

type NearbyResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry?: { location?: { lat: number; lng: number } };
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
};

type PlaceDetails = {
  result?: {
    name?: string;
    website?: string;
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
    types?: string[];
    rating?: number;
    user_ratings_total?: number;
    editorial_summary?: { overview?: string };
  };
};

function categoryFromTypes(types: string[] | undefined, name: string): string {
  const lower = `${(types ?? []).join(" ")} ${name}`.toLowerCase();
  if (lower.includes("national_park") || lower.includes("park")) return "Nature & Park";
  if (lower.includes("museum")) return "Museum";
  if (lower.includes("art_gallery")) return "Gallery";
  if (lower.includes("zoo") || lower.includes("aquarium")) return "Wildlife";
  if (lower.includes("amusement")) return "Theme Park";
  if (lower.includes("tourist")) return "Attraction";
  return "Things to Do";
}

function isAttractionPlace(types: string[] | undefined): boolean {
  if (!types?.length) return true;
  return !types.some((type) => EXCLUDED_TYPES.has(type));
}

async function nearbySearch(type: string, apiKey: string, pageToken?: string): Promise<NearbyResult[]> {
  const { latitude, longitude } = SPICERS_CLOVELLY_COORDINATES;
  const params = new URLSearchParams({
    key: apiKey,
    location: `${latitude},${longitude}`,
    radius: String(RADIUS_M),
    type,
  });
  if (pageToken) params.set("pagetoken", pageToken);

  const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`);
  const data = (await res.json()) as {
    status: string;
    results?: NearbyResult[];
    next_page_token?: string;
    error_message?: string;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Nearby search failed (${type}): ${data.status} ${data.error_message ?? ""}`);
  }

  const results = data.results ?? [];
  if (data.next_page_token) {
    await new Promise((r) => setTimeout(r, 2200));
    const more = await nearbySearch(type, apiKey, data.next_page_token);
    return [...results, ...more];
  }
  return results;
}

async function placeDetails(placeId: string, apiKey: string): Promise<PlaceDetails["result"]> {
  const params = new URLSearchParams({
    key: apiKey,
    place_id: placeId,
    fields:
      "name,website,formatted_address,geometry,types,rating,user_ratings_total,editorial_summary",
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const data = (await res.json()) as PlaceDetails & { status: string; error_message?: string };
  if (data.status !== "OK") {
    throw new Error(`Place details failed: ${data.status} ${data.error_message ?? ""}`);
  }
  return data.result;
}

function toAttractionRecord(nearby: NearbyResult, details: PlaceDetails["result"]): AttractionRecord | null {
  if (nearby.business_status === "CLOSED_PERMANENTLY") return null;

  const types = details?.types ?? nearby.types ?? [];
  if (!isAttractionPlace(types)) return null;

  const rating = details?.rating ?? nearby.rating;
  const reviewCount = details?.user_ratings_total ?? nearby.user_ratings_total ?? 0;
  if (typeof rating === "number" && rating < MIN_RATING) return null;
  if (reviewCount < MIN_REVIEWS) return null;

  const lat = details?.geometry?.location?.lat ?? nearby.geometry?.location?.lat;
  const lng = details?.geometry?.location?.lng ?? nearby.geometry?.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const name = details?.name ?? nearby.name;
  const category = categoryFromTypes(types, name);
  const description =
    details?.editorial_summary?.overview?.trim() ||
    `Highly rated ${category.toLowerCase()} on the Sunshine Coast hinterland.`;

  return {
    googlePlaceId: nearby.place_id,
    name,
    latitude: lat,
    longitude: lng,
    category,
    topicTags: inferTopicTags({ title: name, category, desc: description }),
    description,
    websiteUrl: details?.website,
    address: details?.formatted_address ?? nearby.vicinity,
    rating,
    reviewCount,
  };
}

async function main() {
  const apiKey = googleMapsServerApiKey();
  if (!apiKey) {
    console.error("Set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (AIzaSy… Maps key, not Gemini).");
    process.exit(1);
  }

  console.log("Seeding curated attractions…");
  await upsertAttractionBatch(SEED_ATTRACTIONS);

  const seen = new Set<string>();
  const collected: AttractionRecord[] = [];

  try {
    for (const type of PLACE_TYPES) {
      console.log(`Fetching ${type}…`);
      const results = await nearbySearch(type, apiKey);
      for (const nearby of results) {
        if (seen.has(nearby.place_id)) continue;
        seen.add(nearby.place_id);

        try {
          const details = await placeDetails(nearby.place_id, apiKey);
          const record = toAttractionRecord(nearby, details);
          if (record) collected.push(record);
        } catch (error) {
          console.warn(`Skipped ${nearby.name}:`, error);
        }

        await new Promise((r) => setTimeout(r, 120));
      }
    }

    collected.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));

    console.log(`Upserting ${collected.length} top-rated Google Places attractions…`);
    const count = await upsertAttractionBatch(collected);
    invalidateAttractionCache();
    console.log(
      `Done — ${SEED_ATTRACTIONS.length} curated + ${count} synced (${collected.length} from Google).`,
    );
  } catch (error) {
    console.warn("Google Places sync skipped:", error);
    invalidateAttractionCache();
    console.log(
      `Done — ${SEED_ATTRACTIONS.length} curated attractions cached (run again after enabling Places API).`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
