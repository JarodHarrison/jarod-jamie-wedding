import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PHOTOBOOTH_BINGO_MAX_SCORE, scoreBingoItems } from "@/lib/photobooth-bingo";

export async function GET() {
  try {
    await requireGuestSession();

    try {
      const progress = await prisma.photoboothBingoProgress.findMany({
      select: {
        checkedItems: true,
        completedAt: true,
        guest: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const leaders = progress
      .map((row) => ({
        name: row.guest.name,
        score: scoreBingoItems(row.checkedItems),
        completed: Boolean(row.completedAt),
      }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || Number(b.completed) - Number(a.completed))
      .slice(0, 15);

    const completedCount = progress.filter((row) => row.completedAt).length;
    const nearComplete = progress.filter(
      (row) =>
        !row.completedAt &&
        scoreBingoItems(row.checkedItems) >= PHOTOBOOTH_BINGO_MAX_SCORE - 2,
    ).length;

    return NextResponse.json({
      leaders,
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
