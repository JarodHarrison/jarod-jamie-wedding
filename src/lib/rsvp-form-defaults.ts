import type { RsvpStatus } from "@prisma/client";
import type { GuestProfile } from "@/types/wedding";

export type RsvpProfileFields = Pick<
  GuestProfile,
  | "rsvpStatus"
  | "phone"
  | "plusOneName"
  | "plusOneGuest"
  | "dietaryNotes"
  | "songRequest"
  | "sayiCustomData"
  | "sayiImportedAt"
  | "rsvpSubmittedAt"
>;

export type RsvpFormState = {
  phone: string;
  attending: "" | "ACCEPTED" | "DECLINED";
  plusOneName: string;
  dietaryNotes: string;
  songRequest: string;
};

function isBlank(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? "";
  return !trimmed || trimmed === "-";
}

function pickSayiValue(
  data: Record<string, string> | null | undefined,
  matchers: ((key: string) => boolean)[],
): string | null {
  if (!data) return null;

  for (const [key, raw] of Object.entries(data)) {
    if (isBlank(raw)) continue;
    const normalized = key.toLowerCase();
    if (matchers.some((match) => match(normalized))) {
      return raw.trim();
    }
  }

  return null;
}

function sayiPhone(data: Record<string, string> | null | undefined): string | null {
  return pickSayiValue(data, [
    (key) => key === "phone" || key === "phone_number" || key === "mobile" || key === "mobile_number",
    (key) => key.includes("phone") && !key.includes("photo"),
    (key) => key.includes("mobile"),
  ]);
}

function sayiDietary(data: Record<string, string> | null | undefined): string | null {
  const direct = pickSayiValue(data, [
    (key) => key.includes("dietary"),
    (key) => key.includes("allerg"),
    (key) => key.includes("food") && key.includes("requirement"),
  ]);
  if (direct) return direct;

  const meal = pickSayiValue(data, [(key) => key.includes("meal choice")]);
  return meal ? `Meal: ${meal}` : null;
}

function sayiSong(data: Record<string, string> | null | undefined): string | null {
  return pickSayiValue(data, [
    (key) => key.includes("song") && key.includes("dancefloor"),
    (key) => key === "song" || key === "song_request" || key === "music_request",
    (key) => key.includes("song") && !key.includes("reason"),
  ]);
}

function sayiPlusOne(data: Record<string, string> | null | undefined): string | null {
  return pickSayiValue(data, [
    (key) => key.includes("plus_one") || key.includes("plusone"),
    (key) => key.includes("guest name") && key.includes("plus"),
  ]);
}

function effectivePlusOneName(profile: RsvpProfileFields): string {
  return profile.plusOneGuest?.name ?? profile.plusOneName ?? sayiPlusOne(profile.sayiCustomData) ?? "";
}

function effectivePhone(profile: RsvpProfileFields): string {
  return profile.phone ?? sayiPhone(profile.sayiCustomData) ?? "";
}

function effectiveDietary(profile: RsvpProfileFields): string {
  return profile.dietaryNotes ?? sayiDietary(profile.sayiCustomData) ?? "";
}

function effectiveSong(profile: RsvpProfileFields): string {
  return profile.songRequest ?? sayiSong(profile.sayiCustomData) ?? "";
}

function effectiveAttending(profile: RsvpProfileFields): "" | "ACCEPTED" | "DECLINED" {
  if (profile.rsvpStatus === "PENDING") return "";
  return profile.rsvpStatus;
}

export function deriveRsvpFormState(profile: RsvpProfileFields): RsvpFormState {
  return {
    phone: effectivePhone(profile),
    attending: effectiveAttending(profile),
    plusOneName: effectivePlusOneName(profile),
    dietaryNotes: effectiveDietary(profile),
    songRequest: effectiveSong(profile),
  };
}

/** Persist empty RSVP columns from Sayi/import data (does not overwrite saved values). */
export function buildRsvpHydrationUpdate(profile: {
  phone: string | null;
  plusOneName: string | null;
  plusOneGuestId?: string | null;
  dietaryNotes: string | null;
  songRequest: string | null;
  sayiCustomData: Record<string, string> | null;
  sayiImportedAt: Date | string | null;
}): Partial<{
  phone: string;
  plusOneName: string;
  dietaryNotes: string;
  songRequest: string;
  profileUpdatedAt: Date;
}> | null {
  if (!profile.sayiImportedAt && !profile.sayiCustomData) return null;

  const update: Partial<{
    phone: string;
    plusOneName: string;
    dietaryNotes: string;
    songRequest: string;
    profileUpdatedAt: Date;
  }> = {};

  if (isBlank(profile.phone)) {
    const phone = sayiPhone(profile.sayiCustomData);
    if (phone) update.phone = phone;
  }

  if (isBlank(profile.plusOneName) && !profile.plusOneGuestId) {
    const plusOneName = sayiPlusOne(profile.sayiCustomData);
    if (plusOneName) update.plusOneName = plusOneName;
  }

  if (isBlank(profile.dietaryNotes)) {
    const dietaryNotes = sayiDietary(profile.sayiCustomData);
    if (dietaryNotes) update.dietaryNotes = dietaryNotes;
  }

  if (isBlank(profile.songRequest)) {
    const songRequest = sayiSong(profile.sayiCustomData);
    if (songRequest) update.songRequest = songRequest;
  }

  if (Object.keys(update).length === 0) return null;

  update.profileUpdatedAt = new Date();
  return update;
}

export function groomDefaultRsvpPatch(
  name: string,
  email?: string | null,
): Partial<{
  rsvpStatus: RsvpStatus;
  guestOfHost: string;
  guestRelationship: string;
  guestRelationshipNote: string;
  rsvpSubmittedAt: Date;
}> {
  const normalized = name.toLowerCase();
  const normalizedEmail = email?.toLowerCase() ?? "";

  const isCoupleInvite = normalized.includes("&");
  const isJarod =
    normalizedEmail === "jarod.harrison87@gmail.com" ||
    normalized.includes("jarod") ||
    normalized.includes("j-rod") ||
    normalized.includes("j rod");
  const isJamie =
    normalizedEmail === "jamie_stocks27@hotmail.com" ||
    normalizedEmail.includes("chef35") ||
    (normalized.includes("jamie") && !isCoupleInvite && normalized.includes("stocks")) ||
    normalized === "jamie" ||
    normalized.includes("jamo");

  if (!isJarod && !isJamie) return {};

  return {
    rsvpStatus: "ACCEPTED",
    guestOfHost: "both",
    guestRelationship: "other",
    guestRelationshipNote: "Groom",
    rsvpSubmittedAt: new Date(),
  };
}
