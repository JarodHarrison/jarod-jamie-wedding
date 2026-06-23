import type { GuestTier } from "@/types/wedding";

export const CLOVELLY_ACCOMMODATION_TYPE = "ON_SITE";

export function hasOnSiteAppAccess(tier: GuestTier | undefined | null): boolean {
  return tier === "ON_SITE" || tier === "PENTHOUSE";
}

export function tierForClovellyAccommodation(
  accommodationType: string | null | undefined,
  currentTier: GuestTier,
): GuestTier | undefined {
  if (accommodationType !== CLOVELLY_ACCOMMODATION_TYPE) return undefined;
  if (currentTier === "PENTHOUSE") return undefined;
  return "ON_SITE";
}

export const LAKESIDE_MEET_GREET = {
  title: "Lakeside Meet & Greet",
  time: "6:00pm",
  date: "25.09",
  attire: "Smart casual",
  loc: "Lake View Deck, Spicers Clovelly Estate",
  desc: "A relaxed welcome on the lakeside for guests staying on-site at Spicers Clovelly Estate the night before the wedding.",
  details: [
    "Welcome drinks on the Lake View Deck overlooking the estate lake and hinterland gardens.",
    "Cheese and charcuterie platters to start the evening.",
    "Relaxed gourmet barbecue dinner at The Long Apron restaurant.",
    "After dinner, gather around the firepit — a low-key welcome before the celebrations kick off on Saturday.",
  ],
  tip: "Spicers will email confirmed on-site guests separately about room payment ($500 per room, per night).",
} as const;
