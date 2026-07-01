/**
 * Sync restaurants, cafes, and bars within 20km of Spicers from Google Places.
 * Run: npm run db:sync-eateries
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

import { prisma } from "../src/lib/prisma";
import { inferCuisineTags } from "../src/lib/eatery-cuisine";
import { SEED_EATERIES, type EateryRecord } from "../src/lib/eatery-seed";
import { upsertEateryBatch, invalidateEateryCache } from "../src/lib/eatery-store";
import { googleMapsServerApiKey } from "../src/lib/google-maps-api-key";
import { SPICERS_CLOVELLY_COORDINATES } from "../src/lib/guest-geo";

const RADIUS_M = 20_000;
const PLACE_TYPES = ["restaurant", "cafe", "bar", "bakery", "meal_takeaway"] as const;

type NearbyResult = {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry?: { location?: { lat: number; lng: number } };
  types?: string[];
  rating?: number;
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
    editorial_summary?: { overview?: string };
  };
};

function categoryFromTypes(types: string[] | undefined, name: string): string {
  const lower = `${(types ?? []).join(" ")} ${name}`.toLowerCase();
  if (lower.includes("bakery")) return "Bakery";
  if (lower.includes("cafe") || lower.includes("coffee")) return "Cafe";
  if (lower.includes("bar") || lower.includes("pub")) return "Bar & Pub";
  if (lower.includes("meal_takeaway") || lower.includes("takeaway")) return "Takeaway";
  return "Restaurant";
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
    fields: "name,website,formatted_address,geometry,types,rating,editorial_summary",
  });
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const data = (await res.json()) as PlaceDetails & { status: string; error_message?: string };
  if (data.status !== "OK") {
    throw new Error(`Place details failed: ${data.status} ${data.error_message ?? ""}`);
  }
  return data.result;
}

function toEateryRecord(nearby: NearbyResult, details: PlaceDetails["result"]): EateryRecord | null {
  if (nearby.business_status === "CLOSED_PERMANENTLY") return null;

  const lat = details?.geometry?.location?.lat ?? nearby.geometry?.location?.lat;
  const lng = details?.geometry?.location?.lng ?? nearby.geometry?.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const name = details?.name ?? nearby.name;
  const types = details?.types ?? nearby.types ?? [];
  const category = categoryFromTypes(types, name);
  const description =
    details?.editorial_summary?.overview?.trim() ||
    `Popular ${category.toLowerCase()} near the Sunshine Coast hinterland.`;

  return {
    googlePlaceId: nearby.place_id,
    name,
    latitude: lat,
    longitude: lng,
    category,
    cuisineTags: inferCuisineTags({ name, category, description, googleTypes: types }),
    description,
    websiteUrl: details?.website,
    address: details?.formatted_address ?? nearby.vicinity,
  };
}

async function main() {
  const apiKey = googleMapsServerApiKey();
  if (!apiKey) {
    console.error("Set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (AIzaSy… Maps key, not Gemini).");
    process.exit(1);
  }

  console.log("Seeding curated eateries…");
  await upsertEateryBatch(SEED_EATERIES);

  const seen = new Set<string>();
  const collected: EateryRecord[] = [];

  try {
    for (const type of PLACE_TYPES) {
      console.log(`Fetching ${type}…`);
      const results = await nearbySearch(type, apiKey);
      for (const nearby of results) {
        if (seen.has(nearby.place_id)) continue;
        seen.add(nearby.place_id);

        try {
          const details = await placeDetails(nearby.place_id, apiKey);
          const record = toEateryRecord(nearby, details);
          if (record) collected.push(record);
        } catch (error) {
          console.warn(`Skipped ${nearby.name}:`, error);
        }

        await new Promise((r) => setTimeout(r, 120));
      }
    }

    console.log(`Upserting ${collected.length} Google Places eateries…`);
    const count = await upsertEateryBatch(collected);
    invalidateEateryCache();
    console.log(`Done — ${SEED_EATERIES.length} curated + ${count} synced (${collected.length} from Google).`);
  } catch (error) {
    console.warn("Google Places sync skipped:", error);
    invalidateEateryCache();
    console.log(`Done — ${SEED_EATERIES.length} curated eateries cached (run again after enabling Places API).`);
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
