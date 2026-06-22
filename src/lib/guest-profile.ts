import type { Prisma } from "@prisma/client";

export const guestProfileSelect = {
  id: true,
  name: true,
  email: true,
  tier: true,
  rsvpStatus: true,
  phone: true,
  plusOneName: true,
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
  wantsSharedTransfer: true,
  arrivalAirport: true,
  arrivalDate: true,
  arrivalTime: true,
  departureAirport: true,
  departureDate: true,
  departureTime: true,
  flightNumber: true,
  passengerCount: true,
  transferNotes: true,
  transferSubmittedAt: true,
  glowUpInterest: true,
  onSiteServiceInterest: true,
  interestsSubmittedAt: true,
  createdAt: true,
} satisfies Prisma.GuestSelect;

export type GuestProfileRecord = Prisma.GuestGetPayload<{ select: typeof guestProfileSelect }>;

export function serializeGuestProfile(guest: GuestProfileRecord) {
  return {
    ...guest,
    rsvpSubmittedAt: guest.rsvpSubmittedAt?.toISOString() ?? null,
    accommodationSubmittedAt: guest.accommodationSubmittedAt?.toISOString() ?? null,
    transferSubmittedAt: guest.transferSubmittedAt?.toISOString() ?? null,
    interestsSubmittedAt: guest.interestsSubmittedAt?.toISOString() ?? null,
    createdAt: guest.createdAt.toISOString(),
  };
}

export type SerializedGuestProfile = ReturnType<typeof serializeGuestProfile>;

export type GuestProfileSection = "rsvp" | "accommodation" | "transfer" | "interests";

export function isGuestProfileSection(value: string): value is GuestProfileSection {
  return value === "rsvp" || value === "accommodation" || value === "transfer" || value === "interests";
}
