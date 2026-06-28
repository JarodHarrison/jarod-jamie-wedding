import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireGuestSession();

    const guests = await prisma.guest.findMany({
      where: { profilePhotoMime: { not: null } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        guestOfHost: true,
        guestRelationship: true,
        guestRelationshipNote: true,
        plusOneName: true,
        profileUpdatedAt: true,
        plusOneGuest: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      guests: guests.map((guest) => ({
        name: guest.name,
        email: guest.email,
        guestOfHost: guest.guestOfHost,
        guestRelationship: guest.guestRelationship,
        guestRelationshipNote: guest.guestRelationshipNote,
        plusOneName: guest.plusOneGuest?.name ?? guest.plusOneName,
        photoUrl: `/api/guest/profile/photo?guestId=${guest.id}&v=${guest.profileUpdatedAt?.getTime() ?? guest.id}`,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load party photos.", 500);
  }
}
