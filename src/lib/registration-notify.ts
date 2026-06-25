import type { SerializedGuestProfile } from "@/lib/guest-profile";
import { sendNotificationEmail } from "@/lib/email";

export type RegistrationEvent =
  | "signup"
  | "rsvp"
  | "accommodation"
  | "transfer"
  | "interests"
  | "identity";

const EVENT_TITLES: Record<RegistrationEvent, string> = {
  signup: "New guest account",
  rsvp: "RSVP submitted",
  accommodation: "Accommodation preferences submitted",
  transfer: "Shared transfer details submitted",
  interests: "Service interest registered",
  identity: "Guest profile photo & details updated",
};

function line(label: string, value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  return `${label}: ${value}`;
}

function formatGuestBlock(guest: Pick<SerializedGuestProfile, "name" | "email" | "phone">) {
  return [line("Name", guest.name), line("Email", guest.email), line("Phone", guest.phone)]
    .filter(Boolean)
    .join("\n");
}

function formatRsvp(guest: SerializedGuestProfile) {
  return [
    formatGuestBlock(guest),
    line("RSVP", guest.rsvpStatus),
    line("Plus one", guest.plusOneName),
    line("Dietary", guest.dietaryNotes),
    line("Song request", guest.songRequest),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatAccommodation(guest: SerializedGuestProfile) {
  return [
    formatGuestBlock(guest),
    line("Staying", guest.accommodationType),
    line("Property", guest.accommodationName),
    line("Address", guest.accommodationAddress),
    line("Check-in", guest.checkInDate),
    line("Check-out", guest.checkOutDate),
    line("Needs shuttle", guest.needsShuttle === null ? null : guest.needsShuttle ? "Yes" : "No"),
    line("Notes", guest.accommodationNotes),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatTransfer(guest: SerializedGuestProfile) {
  return [
    formatGuestBlock(guest),
    line("Wants shared transfer", guest.wantsSharedTransfer ? "Yes" : "No"),
    line("Arrival", guest.arrivalAirport ? `${guest.arrivalAirport} ${guest.arrivalDate ?? ""} ${guest.arrivalTime ?? ""}`.trim() : null),
    line("Departure", guest.departureAirport ? `${guest.departureAirport} ${guest.departureDate ?? ""} ${guest.departureTime ?? ""}`.trim() : null),
    line("Flight", guest.flightNumber),
    line("Passengers", guest.passengerCount),
    line("Notes", guest.transferNotes),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatInterests(guest: SerializedGuestProfile) {
  return [
    formatGuestBlock(guest),
    line("Glow up interest", guest.glowUpInterest),
    line("On-site services", guest.onSiteServiceInterest),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatIdentity(guest: SerializedGuestProfile) {
  return [
    formatGuestBlock(guest),
    line("Guest of", guest.guestOfHost),
    line("Relationship", guest.guestRelationship),
    line("Relationship note", guest.guestRelationshipNote),
    line("Profile photo", guest.hasProfilePhoto ? "Uploaded" : null),
  ]
    .filter(Boolean)
    .join("\n");
}

export function notifyRegistration(event: RegistrationEvent, guest: SerializedGuestProfile) {
  const title = EVENT_TITLES[event];
  let body = formatGuestBlock(guest);

  if (event === "rsvp") body = formatRsvp(guest);
  if (event === "accommodation") body = formatAccommodation(guest);
  if (event === "transfer") body = formatTransfer(guest);
  if (event === "interests") body = formatInterests(guest);
  if (event === "identity") body = formatIdentity(guest);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jarod-jamie-wedding-delta.vercel.app";
  const text = `${title}\n\n${body}\n\nView in admin: ${appUrl}`;

  void sendNotificationEmail(`[Wedding] ${title} — ${guest.name}`, text);
}
