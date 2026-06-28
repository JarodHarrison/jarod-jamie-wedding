import type { SerializedGuestProfile } from "@/lib/guest-profile";
import { giftColourLabel } from "@/lib/gift-colour-choices";
import { sendNotificationEmail } from "@/lib/email";
import { adminGuestEventEmailHtml } from "@/lib/email-templates";

export type RegistrationEvent =
  | "signup"
  | "rsvp"
  | "accommodation"
  | "transfer"
  | "interests"
  | "gift-colours"
  | "identity"
  | "companion";

const EVENT_TITLES: Record<RegistrationEvent, string> = {
  signup: "New guest account created",
  rsvp: "RSVP updated",
  accommodation: "Accommodation & shuttle planning updated",
  transfer: "Airport transfer details updated",
  interests: "Pre-wedding or on-site service interest",
  "gift-colours": "Gift colour preferences updated",
  identity: "Guest profile details updated",
  companion: "Plus-one / companion details updated",
};

const GLOW_UP_LABELS: Record<string, string> = {
  teeth: "Teeth whitening",
  botox: "Botox pump party",
  both: "Teeth whitening & Botox",
};

const ON_SITE_LABELS: Record<string, string> = {
  hair: "Hair & make-up",
  barber: "Barber / fresh cut",
  both: "Hair & make-up and barber",
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
    line("Needs courtesy shuttle", guest.needsShuttle === null ? null : guest.needsShuttle ? "Yes" : "No"),
    line("Notes", guest.accommodationNotes),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatTransfer(guest: SerializedGuestProfile) {
  return [
    formatGuestBlock(guest),
    line("Wants shared airport transfer", guest.wantsSharedTransfer ? "Yes" : "No"),
    line(
      "Arrival",
      guest.arrivalAirport
        ? `${guest.arrivalAirport} ${guest.arrivalDate ?? ""} ${guest.arrivalTime ?? ""}`.trim()
        : null,
    ),
    line(
      "Departure",
      guest.departureAirport
        ? `${guest.departureAirport} ${guest.departureDate ?? ""} ${guest.departureTime ?? ""}`.trim()
        : null,
    ),
    line("Flight", guest.flightNumber),
    line("Passengers", guest.passengerCount),
    line("Notes", guest.transferNotes),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatInterests(guest: SerializedGuestProfile) {
  const glowUp = guest.glowUpInterest
    ? GLOW_UP_LABELS[guest.glowUpInterest] ?? guest.glowUpInterest
    : null;
  const onSite = guest.onSiteServiceInterest
    ? ON_SITE_LABELS[guest.onSiteServiceInterest] ?? guest.onSiteServiceInterest
    : null;

  return [
    formatGuestBlock(guest),
    line("Pre-wedding glow-up", glowUp),
    line("On-site services (wedding day)", onSite),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatCompanion(guest: SerializedGuestProfile) {
  const linked = guest.plusOneGuest?.name ?? null;
  return [
    formatGuestBlock(guest),
    line("Here with (linked guest)", linked),
    line("Here with (name only)", linked ? null : guest.plusOneName),
    line("Companion photo uploaded", guest.hasCompanionPhoto ? "Yes" : null),
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

function formatGiftColours(guest: SerializedGuestProfile) {
  return [
    formatGuestBlock(guest),
    line("First choice", giftColourLabel(guest.giftColourChoice1)),
    line("Second choice", giftColourLabel(guest.giftColourChoice2)),
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
  if (event === "gift-colours") body = formatGiftColours(guest);
  if (event === "identity") body = formatIdentity(guest);
  if (event === "companion") body = formatCompanion(guest);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jarodandjamiewedding.com";
  const detailLines = body.split("\n").filter(Boolean);
  const subject = `[Wedding] ${title}: ${guest.name}`;
  const text = `${detailLines.join("\n")}\n\nView guest list in admin:\n${appUrl}`;
  const html = adminGuestEventEmailHtml(title, detailLines, appUrl);

  void sendNotificationEmail(subject, text, html);
}
