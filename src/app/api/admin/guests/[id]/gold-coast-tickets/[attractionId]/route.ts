import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import {
  GOLD_COAST_TICKET_ACCEPT,
  GOLD_COAST_TICKET_MAX_BYTES,
  isAllowedTicketMime,
  isGoldCoastTicketAttractionId,
  serializeGoldCoastTicket,
} from "@/lib/gold-coast-tickets";
import { goldCoastTicketSelect } from "@/lib/gold-coast-tickets-server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string; attractionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminAccess();
    const { id, attractionId } = await context.params;

    if (!isGoldCoastTicketAttractionId(attractionId)) {
      return jsonError("Unknown attraction.", 404);
    }

    const ticket = await prisma.guestAttractionTicket.findUnique({
      where: {
        guestId_attractionId: {
          guestId: id,
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
    return jsonError("Failed to load ticket.", 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminAccess();
    const { id, attractionId } = await context.params;

    if (!isGoldCoastTicketAttractionId(attractionId)) {
      return jsonError("Unknown attraction.", 404);
    }

    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!guest) {
      return jsonError("Guest not found.", 404);
    }

    const formData = await request.formData();
    const file = formData.get("ticket");

    if (!(file instanceof File)) {
      return jsonError("Please choose a file to upload.", 400);
    }

    if (!isAllowedTicketMime(file.type)) {
      return jsonError(`Use a supported file (${GOLD_COAST_TICKET_ACCEPT}).`, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > GOLD_COAST_TICKET_MAX_BYTES) {
      return jsonError("File is too large. Please use a file under 5MB.", 400);
    }

    const ticket = await prisma.guestAttractionTicket.upsert({
      where: {
        guestId_attractionId: {
          guestId: id,
          attractionId,
        },
      },
      create: {
        guestId: id,
        attractionId,
        ticketMime: file.type,
        ticketData: buffer,
        fileName: file.name,
        uploadedAt: new Date(),
      },
      update: {
        ticketMime: file.type,
        ticketData: buffer,
        fileName: file.name,
        uploadedAt: new Date(),
      },
      select: goldCoastTicketSelect,
    });

    return NextResponse.json({
      ticket: serializeGoldCoastTicket(attractionId, ticket),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to upload ticket.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminAccess();
    const { id, attractionId } = await context.params;

    if (!isGoldCoastTicketAttractionId(attractionId)) {
      return jsonError("Unknown attraction.", 404);
    }

    await prisma.guestAttractionTicket.deleteMany({
      where: {
        guestId: id,
        attractionId,
      },
    });

    return NextResponse.json({
      ticket: serializeGoldCoastTicket(attractionId, null),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to remove ticket.", 500);
  }
}
