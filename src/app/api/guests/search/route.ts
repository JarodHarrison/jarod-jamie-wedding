import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await requireGuestSession();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({ guests: [] });
    }

    const guests = await prisma.guest.findMany({
      where: {
        id: { not: session.id },
        rsvpStatus: "ACCEPTED",
        name: { contains: query, mode: "insensitive" },
      },
      orderBy: { name: "asc" },
      take: 12,
      select: {
        id: true,
        name: true,
        profilePhotoMime: true,
      },
    });

    return NextResponse.json({
      guests: guests.map((guest) => ({
        id: guest.id,
        name: guest.name,
        hasProfilePhoto: Boolean(guest.profilePhotoMime),
        photoUrl: guest.profilePhotoMime
          ? `/api/guest/profile/photo?guestId=${guest.id}`
          : null,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to search guests.", 500);
  }
}
