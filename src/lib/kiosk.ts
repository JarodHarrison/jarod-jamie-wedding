import crypto from "node:crypto";

export const KIOSK_SLIDE_SECONDS = 14;
export const KIOSK_SESSION_HOURS = 12;
export const KIOSK_FEED_POLL_MS = 20_000;

export const SHARED_PHOTO_MAX_BYTES = 8_000_000;
export const SHARED_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

export function generateKioskDisplayCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export function generateKioskFeedToken() {
  return crypto.randomBytes(24).toString("hex");
}

export type KioskSlide = {
  id: string;
  kind: "story" | "shared-photo" | "profile-photo" | "hashtag";
  imageUrl: string;
  name: string;
  text: string;
  mood: string | null;
  externalUrl?: string | null;
};
