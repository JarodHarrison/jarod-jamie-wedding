import { NextResponse } from "next/server";
import type { GuestTier } from "@/types/wedding";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidGuestTier(tier: string): tier is GuestTier {
  return tier === "PENTHOUSE" || tier === "ON_SITE" || tier === "OFF_SITE";
}

export const GUEST_TIER_LABELS: Record<GuestTier, string> = {
  PENTHOUSE: "Penthouse",
  ON_SITE: "On-site Guest",
  OFF_SITE: "Off-site Guest",
};
