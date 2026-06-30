import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireGuestSession();

    const guests = await prisma.guest.findMany({
      where: {
        profilePhotoMime: { not: null },
        rsvpStatus: "ACCEPTED",
      },
      orderBy: { name: "asc" },
      take: 120,
      select: {
        id: true,
        name: true,
        guestOfHost: true,
        guestRelationship: true,
        guestRelationshipNote: true,
        profilePhotoMime: true,
        profileUpdatedAt: true,
        plusOneName: true,
        plusOneGuest: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(
      {
        guests: guests.map((guest) => ({
          id: guest.id,
          name: guest.name,
          guestOfHost: guest.guestOfHost,
          guestRelationship: guest.guestRelationship,
          guestRelationshipNote: guest.guestRelationshipNote,
          plusOneName: guest.plusOneGuest?.name ?? guest.plusOneName,
          photoUrl: `/api/guest/profile/photo?guestId=${guest.id}&v=${guest.profileUpdatedAt?.getTime() ?? guest.id}`,
        })),
        total: guests.length,
      },
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load guest wall.", 500);
  }
}
