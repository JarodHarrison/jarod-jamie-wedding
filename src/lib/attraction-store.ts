import { prisma } from "@/lib/prisma";
import {
  ATTRACTION_RADIUS_KM,
  DEFAULT_ATTRACTION_PICKS,
  SEED_ATTRACTIONS,
  type AttractionRecord,
} from "@/lib/attraction-seed";
import { scoreAttractionForQuery, extractTopicIntent } from "@/lib/attraction-topics";
import type { GeoPoint } from "@/lib/guest-geo";
import { haversineKm, estimateDriveMinutes } from "@/lib/guest-geo";

export type ScoredAttraction = AttractionRecord & {
  driveMinutes: number;
  distanceKm: number;
  score: number;
};

let memoryCache: { loadedAt: number; attractions: AttractionRecord[] } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

function mapDbRow(row: {
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  topicTags: string[];
  description: string;
  websiteUrl: string | null;
  address: string | null;
  googlePlaceId: string | null;
  rating: number | null;
  reviewCount: number | null;
}): AttractionRecord {
  return {
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    category: row.category,
    topicTags: row.topicTags,
    description: row.description,
    websiteUrl: row.websiteUrl ?? undefined,
    address: row.address ?? undefined,
    googlePlaceId: row.googlePlaceId ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.reviewCount ?? undefined,
  };
}

export async function loadAttractions(): Promise<AttractionRecord[]> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.loadedAt < CACHE_TTL_MS) {
    return memoryCache.attractions;
  }

  try {
    const rows = await prisma.hinterlandAttraction.findMany({
      select: {
        name: true,
        latitude: true,
        longitude: true,
        category: true,
        topicTags: true,
        description: true,
        websiteUrl: true,
        address: true,
        googlePlaceId: true,
        rating: true,
        reviewCount: true,
      },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    });

    const attractions = rows.length > 0 ? rows.map(mapDbRow) : SEED_ATTRACTIONS;
    memoryCache = { loadedAt: now, attractions };
    return attractions;
  } catch {
    return SEED_ATTRACTIONS;
  }
}

export function invalidateAttractionCache(): void {
  memoryCache = null;
}

function withinRadius(origin: GeoPoint, attraction: AttractionRecord, radiusKm: number): boolean {
  return (
    haversineKm(origin, { latitude: attraction.latitude, longitude: attraction.longitude }) <= radiusKm
  );
}

function ratingSort(a: ScoredAttraction, b: ScoredAttraction): number {
  const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
  if (ratingDiff !== 0) return ratingDiff;
  return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
}

export async function searchAttractions(
  query: string,
  origin: GeoPoint,
  options?: { limit?: number; radiusKm?: number },
): Promise<ScoredAttraction[]> {
  const limit = options?.limit ?? 3;
  const radiusKm = options?.radiusKm ?? ATTRACTION_RADIUS_KM;
  const pool = await loadAttractions();
  const topicIntent = extractTopicIntent(query);

  const ranked = pool
    .filter((attraction) => withinRadius(origin, attraction, radiusKm))
    .map((attraction) => {
      const distanceKm = haversineKm(origin, {
        latitude: attraction.latitude,
        longitude: attraction.longitude,
      });
      const driveMinutes = estimateDriveMinutes(origin, {
        latitude: attraction.latitude,
        longitude: attraction.longitude,
      });
      const score = scoreAttractionForQuery(attraction, query);
      return { ...attraction, distanceKm, driveMinutes, score };
    })
    .sort((a, b) => b.score - a.score || ratingSort(a, b) || a.driveMinutes - b.driveMinutes);

  const withTopicMatch =
    topicIntent.length > 0
      ? ranked.filter((row) => row.score >= 8)
      : ranked.filter((row) => row.score > 0);

  const source = withTopicMatch.length > 0 ? withTopicMatch : [...ranked].sort((a, b) => ratingSort(a, b));

  const picks: ScoredAttraction[] = [];
  const seen = new Set<string>();

  for (const row of source) {
    if (picks.length >= limit) break;
    if (seen.has(row.name)) continue;
    picks.push(row);
    seen.add(row.name);
  }

  if (picks.length < limit) {
    for (const title of DEFAULT_ATTRACTION_PICKS) {
      if (picks.length >= limit) break;
      const match = ranked.find((row) => row.name === title);
      if (match && !seen.has(match.name)) {
        picks.push(match);
        seen.add(match.name);
      }
    }
  }

  if (picks.length < limit) {
    for (const row of ranked.sort((a, b) => ratingSort(a, b))) {
      if (picks.length >= limit) break;
      if (!seen.has(row.name)) {
        picks.push(row);
        seen.add(row.name);
      }
    }
  }

  return picks.slice(0, limit);
}

export async function upsertAttractionBatch(attractions: AttractionRecord[]): Promise<number> {
  let count = 0;
  for (const attraction of attractions) {
    const data = {
      name: attraction.name,
      latitude: attraction.latitude,
      longitude: attraction.longitude,
      category: attraction.category,
      topicTags: attraction.topicTags,
      description: attraction.description,
      websiteUrl: attraction.websiteUrl ?? null,
      address: attraction.address ?? null,
      rating: attraction.rating ?? null,
      reviewCount: attraction.reviewCount ?? null,
    };

    if (attraction.googlePlaceId) {
      await prisma.hinterlandAttraction.upsert({
        where: { googlePlaceId: attraction.googlePlaceId },
        create: { googlePlaceId: attraction.googlePlaceId, ...data },
        update: data,
      });
    } else {
      const existing = await prisma.hinterlandAttraction.findFirst({
        where: { name: attraction.name },
        select: { id: true },
      });
      if (existing) {
        await prisma.hinterlandAttraction.update({ where: { id: existing.id }, data });
      } else {
        await prisma.hinterlandAttraction.create({ data });
      }
    }
    count += 1;
  }
  invalidateAttractionCache();
  return count;
}
