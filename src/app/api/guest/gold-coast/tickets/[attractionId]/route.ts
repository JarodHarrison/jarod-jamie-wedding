import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { isGoldCoastTicketAttractionId } from "@/lib/gold-coast-tickets";
import { assertGuestCanViewGoldCoastTickets } from "@/lib/gold-coast-tickets-server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ attractionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireGuestSession();
    await assertGuestCanViewGoldCoastTickets(session.id);

    const { attractionId } = await context.params;
    if (!isGoldCoastTicketAttractionId(attractionId)) {
      return jsonError("Unknown attraction.", 404);
    }

    const ticket = await prisma.guestAttractionTicket.findUnique({
      where: {
        guestId_attractionId: {
          guestId: session.id,
          attractionId,
        },
      },
      select: {
        ticketMime: true,
        ticketData: true,
        fileName: true,
      },
    });

    if (!ticket?.ticketData || !ticket.ticketMime) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(Buffer.from(ticket.ticketData), {
      headers: {
        "Content-Type": ticket.ticketMime,
        "Content-Disposition": `inline; filename="${ticket.fileName ?? `${attractionId}-ticket`}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return jsonError("Forbidden", 403);
    }
    return jsonError("Failed to load ticket.", 500);
  }
}
