import type { BedPreference } from "@/lib/bed-preference";
import { isBedPreference } from "@/lib/bed-preference";
import { SPICERS_CLOVELLY } from "@/lib/hinterland-accommodations";
import { hasOnSiteAppAccess } from "@/lib/on-site-access";
import type { GuestProfile } from "@/types/wedding";

export type AccommodationProfileFields = Pick<
  GuestProfile,
  | "tier"
  | "accommodationType"
  | "accommodationName"
  | "accommodationAddress"
  | "checkInDate"
  | "checkOutDate"
  | "needsShuttle"
  | "accommodationNotes"
  | "bedPreference"
  | "assignedRoomName"
  | "assignedRoomDetails"
  | "assignedRoomCheckIn"
  | "assignedRoomCheckOut"
  | "assignedRoomConfiguration"
>;

export type AccommodationFormState = {
  accommodationType: string;
  accommodationName: string;
  accommodationAddress: string;
  checkInDate: string;
  checkOutDate: string;
  needsShuttle: boolean;
  accommodationNotes: string;
  bedPreference: BedPreference | "";
  isOnSiteGuest: boolean;
  hasRoomAllocation: boolean;
  allocatedRoomName: string | null;
};

/** Parse spreadsheet / free-text dates into `YYYY-MM-DD` for date inputs. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const dmy = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
}

export function bedPreferenceFromRoomConfiguration(
  configuration: string | null | undefined,
): BedPreference | "" {
  if (!configuration?.trim()) return "";
  const lower = configuration.toLowerCase();
  if (lower.includes("king")) return "KING";
  if (lower.includes("twin") || lower.includes("double")) return "TWIN";
  return "";
}

export function guestIsOnSiteForAccommodation(profile: AccommodationProfileFields): boolean {
  if (hasOnSiteAppAccess(profile.tier, { assignedRoomName: profile.assignedRoomName })) {
    return true;
  }
  if (profile.accommodationType === "ON_SITE") return true;
  return Boolean(profile.assignedRoomName?.trim());
}

function mergeRoomDetailsIntoNotes(
  existingNotes: string | null | undefined,
  roomDetails: string | null | undefined,
): string {
  const notes = existingNotes?.trim() ?? "";
  const details = roomDetails?.trim();
  if (!details) return notes;

  const detailLines = details.split("\n").map((line) => line.trim()).filter(Boolean);
  const alreadyIncluded = detailLines.every((line) => notes.includes(line));
  if (alreadyIncluded) return notes;

  return notes ? `${notes}\n${details}` : details;
}

export function deriveAccommodationFormState(
  profile: AccommodationProfileFields,
): AccommodationFormState {
  const hasRoomAllocation = Boolean(profile.assignedRoomName?.trim());
  const isOnSiteGuest = guestIsOnSiteForAccommodation(profile);

  let accommodationType = profile.accommodationType ?? "";
  if (!accommodationType && isOnSiteGuest) {
    accommodationType = "ON_SITE";
  }

  let accommodationName = profile.accommodationName?.trim() ?? "";
  if (hasRoomAllocation && profile.assignedRoomName) {
    const roomLabel = `${SPICERS_CLOVELLY.name} — ${profile.assignedRoomName}`;
    if (!accommodationName || accommodationName === SPICERS_CLOVELLY.name) {
      accommodationName = roomLabel;
    }
  } else if (!accommodationName && accommodationType === "ON_SITE") {
    accommodationName = SPICERS_CLOVELLY.name;
  }

  let accommodationAddress = profile.accommodationAddress?.trim() ?? "";
  if (!accommodationAddress && accommodationType === "ON_SITE") {
    accommodationAddress = SPICERS_CLOVELLY.address;
  }

  const checkInDate =
    toDateInputValue(profile.checkInDate) || toDateInputValue(profile.assignedRoomCheckIn);
  const checkOutDate =
    toDateInputValue(profile.checkOutDate) || toDateInputValue(profile.assignedRoomCheckOut);

  let bedPreference: BedPreference | "" = "";
  if (isBedPreference(profile.bedPreference)) {
    bedPreference = profile.bedPreference;
  } else {
    bedPreference = bedPreferenceFromRoomConfiguration(profile.assignedRoomConfiguration);
  }

  return {
    accommodationType,
    accommodationName,
    accommodationAddress,
    checkInDate,
    checkOutDate,
    needsShuttle: isOnSiteGuest ? false : Boolean(profile.needsShuttle),
    accommodationNotes: mergeRoomDetailsIntoNotes(
      profile.accommodationNotes,
      profile.assignedRoomDetails,
    ),
    bedPreference,
    isOnSiteGuest,
    hasRoomAllocation,
    allocatedRoomName: profile.assignedRoomName,
  };
}
