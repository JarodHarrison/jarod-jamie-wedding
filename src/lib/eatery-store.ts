import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EAT_PICKS,
  EATERY_RADIUS_KM,
  SEED_EATERIES,
  type EateryRecord,
} from "@/lib/eatery-seed";
import { scoreEateryForQuery, extractCuisineIntent } from "@/lib/eatery-cuisine";
import type { GeoPoint } from "@/lib/guest-geo";
import { haversineKm, estimateDriveMinutes } from "@/lib/guest-geo";

export type ScoredEatery = EateryRecord & {
  driveMinutes: number;
  distanceKm: number;
  score: number;
};

let memoryCache: { loadedAt: number; eateries: EateryRecord[] } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

function mapDbRow(row: {
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  cuisineTags: string[];
  description: string;
  websiteUrl: string | null;
  address: string | null;
  googlePlaceId: string | null;
}): EateryRecord {
  return {
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    category: row.category,
    cuisineTags: row.cuisineTags,
    description: row.description,
    websiteUrl: row.websiteUrl ?? undefined,
    address: row.address ?? undefined,
    googlePlaceId: row.googlePlaceId ?? undefined,
  };
}

export async function loadEateries(): Promise<EateryRecord[]> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.loadedAt < CACHE_TTL_MS) {
    return memoryCache.eateries;
  }

  try {
    const rows = await prisma.hinterlandEatery.findMany({
      select: {
        name: true,
        latitude: true,
        longitude: true,
        category: true,
        cuisineTags: true,
        description: true,
        websiteUrl: true,
        address: true,
        googlePlaceId: true,
      },
    });

    const eateries = rows.length > 0 ? rows.map(mapDbRow) : SEED_EATERIES;
    memoryCache = { loadedAt: now, eateries };
    return eateries;
  } catch {
    return SEED_EATERIES;
  }
}

export function invalidateEateryCache(): void {
  memoryCache = null;
}

function withinRadius(origin: GeoPoint, eatery: EateryRecord, radiusKm: number): boolean {
  return haversineKm(origin, { latitude: eatery.latitude, longitude: eatery.longitude }) <= radiusKm;
}

export async function searchEateries(
  query: string,
  origin: GeoPoint,
  options?: { limit?: number; radiusKm?: number },
): Promise<ScoredEatery[]> {
  const limit = options?.limit ?? 3;
  const radiusKm = options?.radiusKm ?? EATERY_RADIUS_KM;
  const pool = await loadEateries();
  const cuisineIntent = extractCuisineIntent(query);

  const ranked = pool
    .filter((eatery) => withinRadius(origin, eatery, radiusKm))
    .map((eatery) => {
      const distanceKm = haversineKm(origin, {
        latitude: eatery.latitude,
        longitude: eatery.longitude,
      });
      const driveMinutes = estimateDriveMinutes(origin, {
        latitude: eatery.latitude,
        longitude: eatery.longitude,
      });
      const score = scoreEateryForQuery(eatery, query);
      return { ...eatery, distanceKm, driveMinutes, score };
    })
    .sort((a, b) => b.score - a.score || a.driveMinutes - b.driveMinutes);

  const withCuisineMatch =
    cuisineIntent.length > 0 ? ranked.filter((row) => row.score >= 8) : ranked.filter((row) => row.score > 0);

  const picks: ScoredEatery[] = [];
  const seen = new Set<string>();

  for (const row of withCuisineMatch) {
    if (picks.length >= limit) break;
    if (seen.has(row.name)) continue;
    picks.push(row);
    seen.add(row.name);
  }

  if (picks.length < limit) {
    for (const title of DEFAULT_EAT_PICKS) {
      if (picks.length >= limit) break;
      const match = ranked.find((row) => row.name === title);
      if (match && !seen.has(match.name)) {
        picks.push(match);
        seen.add(match.name);
      }
    }
  }

  if (picks.length < limit) {
    for (const row of ranked) {
      if (picks.length >= limit) break;
      if (!seen.has(row.name)) {
        picks.push(row);
        seen.add(row.name);
      }
    }
  }

  return picks.slice(0, limit);
}

export async function upsertEateryBatch(eateries: EateryRecord[]): Promise<number> {
  let count = 0;
  for (const eatery of eateries) {
    if (eatery.googlePlaceId) {
      await prisma.hinterlandEatery.upsert({
        where: { googlePlaceId: eatery.googlePlaceId },
        create: {
          googlePlaceId: eatery.googlePlaceId,
          name: eatery.name,
          latitude: eatery.latitude,
          longitude: eatery.longitude,
          category: eatery.category,
          cuisineTags: eatery.cuisineTags,
          description: eatery.description,
          websiteUrl: eatery.websiteUrl ?? null,
          address: eatery.address ?? null,
        },
        update: {
          name: eatery.name,
          latitude: eatery.latitude,
          longitude: eatery.longitude,
          category: eatery.category,
          cuisineTags: eatery.cuisineTags,
          description: eatery.description,
          websiteUrl: eatery.websiteUrl ?? null,
          address: eatery.address ?? null,
        },
      });
    } else {
      const existing = await prisma.hinterlandEatery.findFirst({
        where: { name: eatery.name },
        select: { id: true },
      });
      if (existing) {
        await prisma.hinterlandEatery.update({
          where: { id: existing.id },
          data: {
            latitude: eatery.latitude,
            longitude: eatery.longitude,
            category: eatery.category,
            cuisineTags: eatery.cuisineTags,
            description: eatery.description,
            websiteUrl: eatery.websiteUrl ?? null,
            address: eatery.address ?? null,
          },
        });
      } else {
        await prisma.hinterlandEatery.create({
          data: {
            name: eatery.name,
            latitude: eatery.latitude,
            longitude: eatery.longitude,
            category: eatery.category,
            cuisineTags: eatery.cuisineTags,
            description: eatery.description,
            websiteUrl: eatery.websiteUrl ?? null,
            address: eatery.address ?? null,
          },
        });
      }
    }
    count += 1;
  }
  invalidateEateryCache();
  return count;
}
