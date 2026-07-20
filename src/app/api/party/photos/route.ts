import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireGuestSession();

    const guests = await prisma.guest.findMany({
      where: {
        OR: [
          { profilePhotoMime: { not: null } },
          { isMc: true },
          { isCelebrant: true },
        ],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        guestOfHost: true,
        guestRelationship: true,
        guestRelationshipNote: true,
        plusOneName: true,
        partyBio: true,
        isMc: true,
        isCelebrant: true,
        profilePhotoMime: true,
        profileUpdatedAt: true,
        plusOneGuest: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(
      {
        guests: guests.map((guest) => ({
          name: guest.name,
          email: guest.email,
          guestOfHost: guest.guestOfHost,
          guestRelationship: guest.guestRelationship,
          guestRelationshipNote: guest.guestRelationshipNote,
          plusOneName: guest.plusOneGuest?.name ?? guest.plusOneName,
          partyBio: guest.partyBio,
          isMc: guest.isMc,
          isCelebrant: guest.isCelebrant,
          photoUrl: guest.profilePhotoMime
            ? `/api/guest/profile/photo?guestId=${guest.id}&v=${guest.profileUpdatedAt?.getTime() ?? guest.id}`
            : "/party/person-placeholder.svg",
        })),
      },
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load party photos.", 500);
  }
}
