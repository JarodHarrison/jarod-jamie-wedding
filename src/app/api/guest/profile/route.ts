import { NextResponse } from "next/server";
import type { RsvpStatus } from "@prisma/client";
import { jsonError } from "@/lib/api-utils";
import {
  guestProfileSelect,
  isGuestProfileSection,
  serializeGuestProfile,
} from "@/lib/guest-profile";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireGuestSession();
    const guest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: guestProfileSelect,
    });

    if (!guest) return jsonError("Guest not found.", 404);

    return NextResponse.json({ profile: serializeGuestProfile(guest) });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireGuestSession();
    const body = await request.json();
    const section = body.section as string;

    if (!isGuestProfileSection(section)) {
      return jsonError("Invalid form section.", 400);
    }

    const now = new Date();
    let data: Record<string, unknown> = {};

    if (section === "rsvp") {
      const attending = body.attending as string | undefined;
      if (attending !== "ACCEPTED" && attending !== "DECLINED") {
        return jsonError("Please select whether you are attending.", 400);
      }

      data = {
        phone: (body.phone ?? "").trim() || null,
        plusOneName: (body.plusOneName ?? "").trim() || null,
        dietaryNotes: (body.dietaryNotes ?? "").trim() || null,
        songRequest: (body.songRequest ?? "").trim() || null,
        rsvpStatus: attending as RsvpStatus,
        rsvpSubmittedAt: now,
      };
    }

    if (section === "accommodation") {
      const accommodationType = (body.accommodationType ?? "").trim();
      if (!accommodationType) {
        return jsonError("Please select where you are staying.", 400);
      }

      data = {
        accommodationType,
        accommodationName: (body.accommodationName ?? "").trim() || null,
        accommodationAddress: (body.accommodationAddress ?? "").trim() || null,
        checkInDate: (body.checkInDate ?? "").trim() || null,
        checkOutDate: (body.checkOutDate ?? "").trim() || null,
        needsShuttle: body.needsShuttle === true,
        accommodationNotes: (body.accommodationNotes ?? "").trim() || null,
        accommodationSubmittedAt: now,
      };
    }

    if (section === "transfer") {
      data = {
        wantsSharedTransfer: body.wantsSharedTransfer === true,
        arrivalAirport: (body.arrivalAirport ?? "").trim() || null,
        arrivalDate: (body.arrivalDate ?? "").trim() || null,
        arrivalTime: (body.arrivalTime ?? "").trim() || null,
        departureAirport: (body.departureAirport ?? "").trim() || null,
        departureDate: (body.departureDate ?? "").trim() || null,
        departureTime: (body.departureTime ?? "").trim() || null,
        flightNumber: (body.flightNumber ?? "").trim() || null,
        passengerCount:
          body.passengerCount === null || body.passengerCount === ""
            ? null
            : Number(body.passengerCount),
        transferNotes: (body.transferNotes ?? "").trim() || null,
        transferSubmittedAt: now,
      };
    }

    if (section === "interests") {
      data = {
        glowUpInterest: body.glowUpInterest ? (body.glowUpInterest as string) : undefined,
        onSiteServiceInterest: body.onSiteServiceInterest
          ? (body.onSiteServiceInterest as string)
          : undefined,
        interestsSubmittedAt: now,
      };

      if (!data.glowUpInterest && !data.onSiteServiceInterest) {
        return jsonError("No interest data provided.", 400);
      }

      if (data.glowUpInterest === undefined) delete data.glowUpInterest;
      if (data.onSiteServiceInterest === undefined) delete data.onSiteServiceInterest;
    }

    const guest = await prisma.guest.update({
      where: { id: session.id },
      data,
      select: guestProfileSelect,
    });

    return NextResponse.json({ profile: serializeGuestProfile(guest) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to save.", 500);
  }
}
