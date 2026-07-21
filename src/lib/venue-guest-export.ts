import type { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import { giftColourLabel } from "@/lib/gift-colour-choices";
import {
  GUEST_OF_HOST_OPTIONS,
  GUEST_RELATIONSHIP_OPTIONS,
} from "@/lib/guest-identity";

export const venueGuestExportSelect = {
  name: true,
  email: true,
  phone: true,
  tier: true,
  rsvpStatus: true,
  plusOneName: true,
  plusOneGuest: { select: { name: true } },
  dietaryNotes: true,
  songRequest: true,
  accommodationType: true,
  accommodationName: true,
  accommodationAddress: true,
  checkInDate: true,
  checkOutDate: true,
  needsShuttle: true,
  accommodationNotes: true,
  assignedRoomName: true,
  assignedRoomDetails: true,
  assignedRoomCheckIn: true,
  assignedRoomCheckOut: true,
  assignedRoomConfiguration: true,
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
  returnShuttleInterest: true,
  returnShuttleAirport: true,
  glowUpInterest: true,
  onSiteServiceInterest: true,
  giftColourChoice1: true,
  giftColourChoice2: true,
  guestOfHost: true,
  guestRelationship: true,
  guestRelationshipNote: true,
  mailingAddress: true,
  sayiPartyName: true,
  sayiCustomData: true,
  seatingTableKey: true,
  seatingSortOrder: true,
} satisfies Prisma.GuestSelect;

export type VenueGuestExportRecord = Prisma.GuestGetPayload<{
  select: typeof venueGuestExportSelect;
}>;

const GLOW_UP_LABELS: Record<string, string> = {
  teeth: "Teeth whitening",
  botox: "Botox / filler",
  both: "Teeth whitening and Botox / filler",
};

const ON_SITE_SERVICE_LABELS: Record<string, string> = {
  hair: "Hair & make-up",
  barber: "Barber / fresh cut",
  both: "Hair & make-up and barber",
};

const RSVP_LABELS = {
  ACCEPTED: "Attending",
  DECLINED: "Declined",
  PENDING: "Pending",
} as const;

function text(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function yesNo(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value ? "Yes" : "No";
}

function optionLabel(
  value: string | null | undefined,
  options: readonly { value: string; label: string }[],
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

function isOnSite(guest: VenueGuestExportRecord): boolean {
  return (
    guest.tier === "ON_SITE" ||
    guest.tier === "PENTHOUSE" ||
    guest.accommodationType === "ON_SITE" ||
    Boolean(guest.assignedRoomName?.trim())
  );
}

function companionName(guest: VenueGuestExportRecord): string {
  return guest.plusOneGuest?.name ?? text(guest.plusOneName);
}

function roomNumber(roomName: string | null): string {
  if (!roomName) return "";
  const matches = roomName.match(/\b\d+[A-Za-z]?\b/g);
  return matches?.at(-1) ?? "";
}

function importedPreferences(value: Prisma.JsonValue | null): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return Object.entries(value)
    .filter(([, entry]) => entry !== null && entry !== "")
    .map(([key, entry]) => `${key}: ${String(entry)}`)
    .join("; ");
}

function guestRow(guest: VenueGuestExportRecord) {
  const onSite = isOnSite(guest);
  return {
    Name: guest.name,
    "RSVP status": RSVP_LABELS[guest.rsvpStatus],
    "Dietary requirements": text(guest.dietaryNotes) || "None advised",
    "Staying on site": yesNo(onSite),
    "Room number": onSite ? roomNumber(guest.assignedRoomName) : "",
    "Assigned room / suite": onSite ? text(guest.assignedRoomName) || "Not assigned" : "",
    "Room configuration": text(guest.assignedRoomConfiguration),
    "Room details": text(guest.assignedRoomDetails),
    "Room check-in": text(guest.assignedRoomCheckIn) || text(guest.checkInDate),
    "Room check-out": text(guest.assignedRoomCheckOut) || text(guest.checkOutDate),
    "Bed preference": text(guest.bedPreference),
    Companion: companionName(guest),
    Party: text(guest.sayiPartyName),
    "Guest of": optionLabel(guest.guestOfHost, GUEST_OF_HOST_OPTIONS),
    Relationship: optionLabel(guest.guestRelationship, GUEST_RELATIONSHIP_OPTIONS),
    "Relationship notes": text(guest.guestRelationshipNote),
    "Song request": text(guest.songRequest),
    "Needs courtesy shuttle": yesNo(guest.needsShuttle),
    "Return shuttle requested": yesNo(guest.returnShuttleInterest),
    "Return shuttle airport": text(guest.returnShuttleAirport),
    "Shared airport transfer": yesNo(guest.wantsSharedTransfer),
    "Arrival airport": text(guest.arrivalAirport),
    "Arrival date": text(guest.arrivalDate),
    "Arrival time": text(guest.arrivalTime),
    "Arrival flight": text(guest.flightNumber),
    "Departure airport": text(guest.departureAirport),
    "Departure date": text(guest.departureDate),
    "Departure time": text(guest.departureTime),
    "Transfer passengers": guest.passengerCount ?? "",
    "Transfer notes": text(guest.transferNotes),
    "On-site service preference": guest.onSiteServiceInterest
      ? ON_SITE_SERVICE_LABELS[guest.onSiteServiceInterest] ?? guest.onSiteServiceInterest
      : "",
    "Glow-up preference": guest.glowUpInterest
      ? GLOW_UP_LABELS[guest.glowUpInterest] ?? guest.glowUpInterest
      : "",
    "Gift colour preference 1": giftColourLabel(guest.giftColourChoice1) ?? "",
    "Gift colour preference 2": giftColourLabel(guest.giftColourChoice2) ?? "",
    "Seating table": guest.seatingTableKey ?? "",
    "Accommodation name": text(guest.accommodationName),
    "Accommodation address": text(guest.accommodationAddress),
    "Accommodation notes": text(guest.accommodationNotes),
    "Mailing address": text(guest.mailingAddress),
    "Other imported preferences": importedPreferences(guest.sayiCustomData),
    Phone: text(guest.phone),
    Email: guest.email,
  };
}

function appendSheet(
  workbook: XLSX.WorkBook,
  name: string,
  rows: Record<string, string | number>[],
  widths: number[],
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = widths.map((wch) => ({ wch }));
  worksheet["!autofilter"] = worksheet["!ref"] ? { ref: worksheet["!ref"] } : undefined;
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
}

export function buildVenueGuestWorkbook(guests: VenueGuestExportRecord[]): Uint8Array {
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Jarod & Jamie Wedding - Venue Guest Details",
    Subject: "Guest numbers, dietary requirements, preferences and room allocations",
    Author: "Jarod & Jamie Wedding Admin",
    CreatedDate: new Date(),
  };

  const accepted = guests.filter((guest) => guest.rsvpStatus === "ACCEPTED");
  const onSiteAccepted = accepted.filter(isOnSite);
  const dietaryAccepted = accepted.filter((guest) => Boolean(guest.dietaryNotes?.trim()));

  const summaryRows = [
    { Metric: "Total guest profiles", Value: guests.length },
    { Metric: "Attending", Value: accepted.length },
    {
      Metric: "Pending RSVP",
      Value: guests.filter((guest) => guest.rsvpStatus === "PENDING").length,
    },
    {
      Metric: "Declined",
      Value: guests.filter((guest) => guest.rsvpStatus === "DECLINED").length,
    },
    { Metric: "Attending with dietary requirements", Value: dietaryAccepted.length },
    { Metric: "Attending and staying on site", Value: onSiteAccepted.length },
    {
      Metric: "Attending on site without an assigned room",
      Value: onSiteAccepted.filter((guest) => !guest.assignedRoomName?.trim()).length,
    },
    {
      Metric: "Attending needing courtesy shuttle",
      Value: accepted.filter((guest) => guest.needsShuttle === true).length,
    },
    {
      Metric: "Attending requesting return shuttle",
      Value: accepted.filter((guest) => guest.returnShuttleInterest === true).length,
    },
  ];
  appendSheet(workbook, "Venue Summary", summaryRows, [44, 14]);

  appendSheet(
    workbook,
    "Attending Guests",
    accepted.map(guestRow),
    [28, 14, 35, 16, 14, 34, 24, 35, 16, 16, 18, 28, 34, 20, 20, 30, 28],
  );

  appendSheet(
    workbook,
    "Dietary Requirements",
    dietaryAccepted.map((guest) => ({
      Name: guest.name,
      "Dietary requirements": text(guest.dietaryNotes),
      "Assigned room / suite": isOnSite(guest) ? text(guest.assignedRoomName) || "Not assigned" : "",
      Companion: companionName(guest),
      Party: text(guest.sayiPartyName),
    })),
    [28, 50, 34, 28, 34],
  );

  const roomGroups = new Map<string, VenueGuestExportRecord[]>();
  for (const guest of onSiteAccepted) {
    const room = text(guest.assignedRoomName) || "Not assigned";
    roomGroups.set(room, [...(roomGroups.get(room) ?? []), guest]);
  }
  appendSheet(
    workbook,
    "Room Allocations",
    [...roomGroups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([room, roomGuests]) => ({
        "Room number": roomNumber(room),
        "Assigned room / suite": room,
        "Guest count": roomGuests.length,
        Guests: roomGuests.map((guest) => guest.name).join(", "),
        "Dietary requirements": roomGuests
          .filter((guest) => guest.dietaryNotes?.trim())
          .map((guest) => `${guest.name}: ${guest.dietaryNotes}`)
          .join("; "),
        "Room configuration": text(roomGuests[0]?.assignedRoomConfiguration),
        "Room details": text(roomGuests[0]?.assignedRoomDetails),
        "Check-in": text(roomGuests[0]?.assignedRoomCheckIn),
        "Check-out": text(roomGuests[0]?.assignedRoomCheckOut),
      })),
    [14, 36, 14, 55, 60, 28, 40, 16, 16],
  );

  appendSheet(
    workbook,
    "All Guests",
    guests.map(guestRow),
    [28, 14, 35, 16, 14, 34, 24, 35, 16, 16, 18, 28, 34, 20, 20, 30, 28],
  );

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer", compression: true });
}
