import { daysUntilWedding, RECOVERY_DAYS } from "@/lib/wedding-event";

/** Off-site guests unlock the venue map this many days before the wedding. */
export const VENUE_MAP_DAYS_BEFORE = 5;

export const VENUE_MAP_IMAGE = "/venue-map.png";

export function canViewVenueMap(
  hasOnSiteAccess: boolean,
  now = new Date(),
  options?: { isAdmin?: boolean },
): boolean {
  if (options?.isAdmin) return true;
  if (process.env.NEXT_PUBLIC_VENUE_MAP_FORCE_VISIBLE === "true") return true;
  if (hasOnSiteAccess) return true;

  const daysUntil = daysUntilWedding(now);
  if (daysUntil >= 0 && daysUntil <= VENUE_MAP_DAYS_BEFORE) return true;
  if (daysUntil < 0 && Math.abs(daysUntil) <= RECOVERY_DAYS) return true;
  return false;
}

export function venueMapUnlockHint(hasOnSiteAccess: boolean, now = new Date()): string | null {
  if (hasOnSiteAccess || canViewVenueMap(hasOnSiteAccess, now)) return null;
  const daysUntil = daysUntilWedding(now);
  if (daysUntil <= VENUE_MAP_DAYS_BEFORE) return null;
  const daysToWait = daysUntil - VENUE_MAP_DAYS_BEFORE;
  return `The venue map unlocks ${daysToWait} day${daysToWait === 1 ? "" : "s"} before the wedding (on-site guests can view it anytime).`;
}
