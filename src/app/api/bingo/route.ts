import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  ANNITA_BINGO_IMAGE,
  isBingoComplete,
  isValidBingoItemId,
  PHOTOBOOTH_BINGO_ITEMS,
  PHOTOBOOTH_BINGO_MAX_SCORE,
  scoreBingoItems,
} from "@/lib/photobooth-bingo";

function bingoPayload(checkedItems: string[], completedAt: Date | null | undefined) {
  return {
    items: PHOTOBOOTH_BINGO_ITEMS,
    checkedItems,
    score: scoreBingoItems(checkedItems),
    maxScore: PHOTOBOOTH_BINGO_MAX_SCORE,
    completed: Boolean(completedAt),
    completedAt: completedAt?.toISOString() ?? null,
  };
}

export async function GET() {
  try {
    const session = await requireGuestSession();

    try {
      const progress = await prisma.photoboothBingoProgress.findUnique({
        where: { guestId: session.id },
      });
      return NextResponse.json(bingoPayload(progress?.checkedItems ?? [], progress?.completedAt));
    } catch (dbError) {
      console.error("[bingo GET] progress lookup failed", dbError);
      return NextResponse.json({
        ...bingoPayload([], null),
        progressUnavailable: true,
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[bingo GET]", error);
    return jsonError("Failed to load photobooth bingo.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireGuestSession();
    const body = await request.json();
    const itemId = (body.itemId ?? "").trim();
    const checked = Boolean(body.checked);

    if (!isValidBingoItemId(itemId)) {
      return jsonError("Invalid bingo item.", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.photoboothBingoProgress.findUnique({
        where: { guestId: session.id },
      });

      const currentChecked = existing?.checkedItems ?? [];
      const nextChecked = checked
        ? Array.from(new Set([...currentChecked, itemId]))
        : currentChecked.filter((id) => id !== itemId);

      const wasComplete = Boolean(existing?.completedAt);
      const nowComplete = isBingoComplete(nextChecked);
      const justCompleted = nowComplete && !wasComplete;

      const progress = await tx.photoboothBingoProgress.upsert({
        where: { guestId: session.id },
        create: {
          guestId: session.id,
          checkedItems: nextChecked,
          completedAt: justCompleted ? new Date() : null,
        },
        update: {
          checkedItems: nextChecked,
          ...(justCompleted ? { completedAt: new Date() } : {}),
        },
      });

      if (justCompleted) {
        const guests = await tx.guest.findMany({
          where: { id: { not: session.id } },
          select: { id: true },
        });
        await tx.inAppNotification.createMany({
          data: guests.map((guest) => ({
            guestId: guest.id,
            title: "Bingo!",
            body: `${session.name} just completed Photobooth Bingo!`,
            imageUrl: ANNITA_BINGO_IMAGE,
          })),
        });
        await tx.inAppNotification.create({
          data: {
            guestId: session.id,
            title: "You did it!",
            body: "Photobooth Bingo complete — you're officially iconic. Go celebrate!",
            imageUrl: ANNITA_BINGO_IMAGE,
          },
        });
      }

      return {
        checkedItems: progress.checkedItems,
        score: scoreBingoItems(progress.checkedItems),
        completed: Boolean(progress.completedAt),
        completedAt: progress.completedAt?.toISOString() ?? null,
        announced: justCompleted,
      };
    });

    return NextResponse.json({
      ...result,
      maxScore: PHOTOBOOTH_BINGO_MAX_SCORE,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[bingo PATCH]", error);
    return jsonError("Failed to update photobooth bingo.", 500);
  }
}
