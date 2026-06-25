import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import {
  buildBingoLeaderboard,
  buildBingoViewerContext,
} from "@/lib/bingo-leaderboard";
import { prisma } from "@/lib/prisma";
import { PHOTOBOOTH_BINGO_MAX_SCORE, scoreBingoItems } from "@/lib/photobooth-bingo";

const LEADERBOARD_PLACEHOLDER = "/kiosk/default-guest.svg";

export async function GET() {
  try {
    const session = await requireGuestSession();

    try {
      const progress = await prisma.photoboothBingoProgress.findMany({
        select: {
          checkedItems: true,
          completedAt: true,
          verifiedAt: true,
          guest: {
            select: {
              id: true,
              name: true,
              profilePhotoMime: true,
              profileUpdatedAt: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      const rows = progress.map((row) => ({
        guestId: row.guest.id,
        name: row.guest.name,
        checkedItems: row.checkedItems,
        completedAt: row.completedAt,
        verifiedAt: row.verifiedAt,
        profilePhotoMime: row.guest.profilePhotoMime,
        profileUpdatedAt: row.guest.profileUpdatedAt,
      }));

      const leaders = buildBingoLeaderboard(rows)
        .slice(0, 15)
        .map((entry) => ({
          ...entry,
          photoUrl: entry.photoUrl ?? LEADERBOARD_PLACEHOLDER,
        }));

      const completedCount = progress.filter((row) => row.completedAt).length;
      const nearComplete = progress.filter(
        (row) =>
          !row.completedAt &&
          scoreBingoItems(row.checkedItems) >= PHOTOBOOTH_BINGO_MAX_SCORE - 2,
      ).length;

      return NextResponse.json({
        leaders,
        viewer: buildBingoViewerContext(leaders, session.id),
        stats: {
          playing: progress.filter((row) => row.checkedItems.length > 0).length,
          completed: completedCount,
          nearComplete,
          maxScore: PHOTOBOOTH_BINGO_MAX_SCORE,
        },
      });
    } catch (dbError) {
      console.error("[bingo/leaderboard GET] failed", dbError);
      return NextResponse.json({
        leaders: [],
        viewer: {
          rank: null,
          score: 0,
          isLeader: false,
          leaderAlert: null,
          chaserAlert: null,
        },
        stats: {
          playing: 0,
          completed: 0,
          nearComplete: 0,
          maxScore: PHOTOBOOTH_BINGO_MAX_SCORE,
        },
        progressUnavailable: true,
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load leaderboard.", 500);
  }
}
