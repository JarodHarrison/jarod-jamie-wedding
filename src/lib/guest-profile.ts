import type { Prisma } from "@prisma/client";
import { guestHasActivatedAppAccount } from "@/lib/guest-account-status";

export const guestProfileSelect = {
  id: true,
  name: true,
  email: true,
  tier: true,
  rsvpStatus: true,
  phone: true,
  plusOneName: true,
  plusOneGuestId: true,
  plusOneGuest: {
    select: {
      id: true,
      name: true,
      email: true,
      profilePhotoMime: true,
      profileUpdatedAt: true,
      createdAt: true,
    },
  },
  companionPhotoMime: true,
  partyRole: true,
  isMc: true,
  dietaryNotes: true,
  songRequest: true,
  rsvpSubmittedAt: true,
  accommodationType: true,
  accommodationName: true,
  accommodationAddress: true,
  checkInDate: true,
  checkOutDate: true,
  needsShuttle: true,
  accommodationNotes: true,
  accommodationSubmittedAt: true,
  assignedRoomName: true,
  assignedRoomDetails: true,
  assignedRoomCheckIn: true,
  assignedRoomCheckOut: true,
  assignedRoomConfiguration: true,
  roomAllocationImportedAt: true,
  bedPreference: true,
  wantsSharedTransfer: true,
  shareTransferContactDetails: true,
  arrivalAirport: true,
  arrivalDate: true,
  arrivalTime: true,
  arrivalMaxWait: true,
  departureAirport: true,
  departureDate: true,
  departureTime: true,
  flightNumber: true,
  passengerCount: true,
  transferNotes: true,
  transferSubmittedAt: true,
  returnShuttleInterest: true,
  returnShuttleAirport: true,
  returnShuttleRegisteredAt: true,
  glowUpInterest: true,
  onSiteServiceInterest: true,
  interestsSubmittedAt: true,
  giftColourChoice1: true,
  giftColourChoice2: true,
  giftColoursSubmittedAt: true,
  profilePhotoMime: true,
  guestOfHost: true,
  guestRelationship: true,
  guestRelationshipNote: true,
  profileUpdatedAt: true,
  mailingAddress: true,
  sayiPartyName: true,
  sayiLink: true,
  sayiPlusOneAllowed: true,
  sayiImportedAt: true,
  sayiCustomData: true,
  createdAt: true,
} satisfies Prisma.GuestSelect;

export type GuestProfileRecord = Prisma.GuestGetPayload<{ select: typeof guestProfileSelect }>;

export const adminGuestSelect = {
  ...guestProfileSelect,
  passwordPlaintext: true,
  _count: {
    select: {
      linkedLogins: true,
      passkeyCredentials: true,
    },
  },
} satisfies Prisma.GuestSelect;

export type AdminGuestRecord = Prisma.GuestGetPayload<{ select: typeof adminGuestSelect }>;

export function serializeGuestProfile(guest: GuestProfileRecord) {
  return {
    ...guest,
    rsvpSubmittedAt: guest.rsvpSubmittedAt?.toISOString() ?? null,
    accommodationSubmittedAt: guest.accommodationSubmittedAt?.toISOString() ?? null,
    roomAllocationImportedAt: guest.roomAllocationImportedAt?.toISOString() ?? null,
    transferSubmittedAt: guest.transferSubmittedAt?.toISOString() ?? null,
    returnShuttleRegisteredAt: guest.returnShuttleRegisteredAt?.toISOString() ?? null,
    interestsSubmittedAt: guest.interestsSubmittedAt?.toISOString() ?? null,
    giftColoursSubmittedAt: guest.giftColoursSubmittedAt?.toISOString() ?? null,
    profileUpdatedAt: guest.profileUpdatedAt?.toISOString() ?? null,
    sayiImportedAt: guest.sayiImportedAt?.toISOString() ?? null,
    sayiCustomData:
      guest.sayiCustomData && typeof guest.sayiCustomData === "object" && !Array.isArray(guest.sayiCustomData)
        ? (guest.sayiCustomData as Record<string, string>)
        : null,
    hasProfilePhoto: Boolean(guest.profilePhotoMime),
    hasCompanionPhoto: Boolean(guest.companionPhotoMime),
    plusOneGuest: guest.plusOneGuest
      ? {
          id: guest.plusOneGuest.id,
          name: guest.plusOneGuest.name,
          email: guest.plusOneGuest.email,
          hasProfilePhoto: Boolean(guest.plusOneGuest.profilePhotoMime),
          photoUrl: guest.plusOneGuest.profilePhotoMime
            ? `/api/guest/profile/photo?guestId=${guest.plusOneGuest.id}`
            : null,
        }
      : null,
    createdAt: guest.createdAt.toISOString(),
  };
}

export type SerializedGuestProfile = ReturnType<typeof serializeGuestProfile>;

export function serializeAdminGuest(guest: AdminGuestRecord) {
  const { _count, passwordPlaintext, ...profileGuest } = guest;
  const linkedLoginCount = _count?.linkedLogins ?? 0;
  const passkeyCount = _count?.passkeyCredentials ?? 0;

  return {
    ...serializeGuestProfile(profileGuest),
    passwordPlaintext: passwordPlaintext ?? null,
    hasAppAccount: guestHasActivatedAppAccount({
      passwordPlaintext,
      linkedLoginCount,
      passkeyCount,
    }),
  };
}

export type SerializedAdminGuest = ReturnType<typeof serializeAdminGuest>;

export type GuestProfileSection =
  | "rsvp"
  | "accommodation"
  | "transfer"
  | "interests"
  | "gift-colours"
  | "identity"
  | "companion";

export function isGuestProfileSection(value: string): value is GuestProfileSection {
  return (
    value === "rsvp" ||
    value === "accommodation" ||
    value === "transfer" ||
    value === "interests" ||
    value === "gift-colours" ||
    value === "identity" ||
    value === "companion"
  );
}
