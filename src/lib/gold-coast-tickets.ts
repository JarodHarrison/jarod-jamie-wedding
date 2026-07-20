import { goldCoastAttractions } from "@/lib/gold-coast-attractions";
import type { GoldCoastVenueImageId } from "@/lib/gold-coast-images";
import type { GuestTier } from "@/types/wedding";

export const GOLD_COAST_TICKET_ATTRACTION_IDS = Object.keys(
  goldCoastAttractions,
) as GoldCoastVenueImageId[];

export const GOLD_COAST_TICKET_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf";

export const GOLD_COAST_TICKET_MAX_BYTES = 5_000_000;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export type GoldCoastTicketRecord = {
  attractionId: string;
  fileName: string | null;
  ticketMime: string | null;
  uploadedAt: Date | null;
};

export type SerializedGoldCoastTicket = {
  attractionId: GoldCoastVenueImageId;
  title: string;
  hasTicket: boolean;
  fileName: string | null;
  uploadedAt: string | null;
};

export function isGoldCoastTicketAttractionId(
  value: string,
): value is GoldCoastVenueImageId {
  return value in goldCoastAttractions;
}

export function guestHasPenthouseTicketAccess(tier: GuestTier | null | undefined): boolean {
  return tier === "PENTHOUSE";
}

export function isAllowedTicketMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime);
}

export function serializeGoldCoastTicket(
  attractionId: GoldCoastVenueImageId,
  ticket: GoldCoastTicketRecord | null | undefined,
): SerializedGoldCoastTicket {
  return {
    attractionId,
    title: goldCoastAttractions[attractionId].title,
    hasTicket: Boolean(ticket?.ticketMime),
    fileName: ticket?.fileName ?? null,
    uploadedAt: ticket?.uploadedAt?.toISOString() ?? null,
  };
}

export function serializeGuestGoldCoastTickets(
  tickets: GoldCoastTicketRecord[],
): SerializedGoldCoastTicket[] {
  const byAttraction = new Map(tickets.map((ticket) => [ticket.attractionId, ticket]));
  return GOLD_COAST_TICKET_ATTRACTION_IDS.map((attractionId) =>
    serializeGoldCoastTicket(attractionId, byAttraction.get(attractionId)),
  );
}
