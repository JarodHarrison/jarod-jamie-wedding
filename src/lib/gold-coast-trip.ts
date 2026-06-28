/** Copy and overview for the pre-wedding Gold Coast itinerary tab. */

import type { GuestTier } from "@/types/wedding";

export function hasGoldCoastAccess(
  tier: GuestTier | undefined | null,
  options?: { canAccessAdmin?: boolean; hasGoldCoastTrip?: boolean },
): boolean {
  if (options?.canAccessAdmin) return true;
  if (options?.hasGoldCoastTrip) return true;
  return tier === "PENTHOUSE";
}

export function isPenthouseItineraryGuest(
  tier: GuestTier | undefined | null,
  options?: { canAccessAdmin?: boolean },
): boolean {
  if (options?.canAccessAdmin) return true;
  return tier === "PENTHOUSE";
}

export const GOLD_COAST_TRIP_DATES = "Tue 22 – Fri 25 Sep 2026";

export const GOLD_COAST_TRIP_INTRO =
  "Join us for a fabulous few days on the Gold Coast before the big gay day — luxury penthouse living, theme park thrills, fine dining, Dracula's cabaret, and a wild morning at Australia Zoo before we head up to Montville.";

export const GOLD_COAST_TRIP_PENTHOUSE_NOTE =
  "Minivan transport between Brisbane, Byron Bay, the Gold Coast, Australia Zoo, and Spicers Clovelly is included. Couples select quantity 2 at Stripe checkout.";

export const GOLD_COAST_TRIP_ULTIMATE_NOTE =
  "Ultimate Experience guests: we'll book your tickets and included dinners — arrange your own accommodation and transport unless you're staying in the penthouse.";
