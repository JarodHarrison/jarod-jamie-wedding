import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminAccess();

    const [
      totalGuests,
      rsvpAccepted,
      rsvpPending,
      profilePhotos,
      storiesTotal,
      storiesHidden,
      storiesReported,
      bingoPlaying,
      bingoCompleted,
    ] = await Promise.all([
      prisma.guest.count(),
      prisma.guest.count({ where: { rsvpStatus: "ACCEPTED" } }),
      prisma.guest.count({ where: { rsvpStatus: "PENDING" } }),
      prisma.guest.count({ where: { profilePhotoMime: { not: null } } }),
      prisma.guestStory.count(),
      prisma.guestStory.count({ where: { status: "HIDDEN" } }),
      prisma.guestStory.count({ where: { reportCount: { gt: 0 } } }),
      prisma.photoboothBingoProgress.count({
        where: { NOT: { checkedItems: { equals: [] } } },
      }),
      prisma.photoboothBingoProgress.count({ where: { completedAt: { not: null } } }),
    ]);

    return NextResponse.json({
      guests: { total: totalGuests, rsvpAccepted, rsvpPending, profilePhotos },
      stories: { total: storiesTotal, hidden: storiesHidden, reported: storiesReported },
      bingo: { playing: bingoPlaying, completed: bingoCompleted },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load stats.", 500);
  }
}
