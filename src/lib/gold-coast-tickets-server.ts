import type { Prisma } from "@prisma/client";
import {
  guestHasPenthouseTicketAccess,
  serializeGuestGoldCoastTickets,
} from "@/lib/gold-coast-tickets";
import { prisma } from "@/lib/prisma";

export const goldCoastTicketSelect = {
  attractionId: true,
  fileName: true,
  ticketMime: true,
  uploadedAt: true,
} satisfies Prisma.GuestAttractionTicketSelect;

export async function loadGuestGoldCoastTickets(guestId: string) {
  const tickets = await prisma.guestAttractionTicket.findMany({
    where: { guestId },
    select: goldCoastTicketSelect,
  });
  return serializeGuestGoldCoastTickets(tickets);
}

export async function assertGuestCanViewGoldCoastTickets(guestId: string) {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { tier: true },
  });

  if (!guest || !guestHasPenthouseTicketAccess(guest.tier)) {
    throw new Error("Forbidden");
  }
}
