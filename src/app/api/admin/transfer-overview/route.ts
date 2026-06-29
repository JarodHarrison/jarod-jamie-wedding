import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { listAdminTransferMatches } from "@/lib/transfer-match";
import { returnShuttleAirportLabel } from "@/lib/return-shuttle";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminAccess();

    const [matches, returnShuttleGuests] = await Promise.all([
      listAdminTransferMatches(),
      prisma.guest.findMany({
        where: {
          returnShuttleInterest: true,
          returnShuttleAirport: { not: null },
          rsvpStatus: "ACCEPTED",
        },
        select: { id: true, name: true, returnShuttleAirport: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const returnShuttle = {
      MCY: returnShuttleGuests
        .filter((guest) => guest.returnShuttleAirport === "MCY")
        .map((guest) => ({ id: guest.id, name: guest.name })),
      BNE: returnShuttleGuests
        .filter((guest) => guest.returnShuttleAirport === "BNE")
        .map((guest) => ({ id: guest.id, name: guest.name })),
    };

    return NextResponse.json({
      matches,
      returnShuttle,
      returnShuttleLabels: {
        MCY: returnShuttleAirportLabel("MCY"),
        BNE: returnShuttleAirportLabel("BNE"),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load transfer overview.", 500);
  }
}
