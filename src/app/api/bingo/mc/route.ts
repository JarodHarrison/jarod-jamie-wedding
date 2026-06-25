import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireMcOrAdminAccess } from "@/lib/auth/mc-access";
import { prisma } from "@/lib/prisma";
import { ANNITA_NOTIFICATION_ICON } from "@/lib/notification-branding";
import { scoreBingoItems } from "@/lib/photobooth-bingo";

function serializeProgress(row: {
  guestId: string;
  checkedItems: string[];
  completedAt: Date | null;
  verifiedAt: Date | null;
  guest: { name: string; email: string };
  verifiedByGuest?: { name: string } | null;
}) {
  return {
    guestId: row.guestId,
    name: row.guest.name,
    email: row.guest.email,
    score: scoreBingoItems(row.checkedItems),
    completedAt: row.completedAt?.toISOString() ?? null,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    verifiedByName: row.verifiedByGuest?.name ?? null,
  };
}

export async function GET(request: Request) {
  try {
    await requireMcOrAdminAccess();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length >= 2) {
      const matches = await prisma.photoboothBingoProgress.findMany({
        where: {
          completedAt: { not: null },
          guest: { name: { contains: query, mode: "insensitive" } },
        },
        take: 12,
        orderBy: { completedAt: "desc" },
        select: {
          guestId: true,
          checkedItems: true,
          completedAt: true,
          verifiedAt: true,
          guest: { select: { name: true, email: true } },
          verifiedByGuest: { select: { name: true } },
        },
      });

      return NextResponse.json({
        results: matches.map(serializeProgress),
      });
    }

    const [pending, verified] = await Promise.all([
      prisma.photoboothBingoProgress.findMany({
        where: { completedAt: { not: null }, verifiedAt: null },
        orderBy: { completedAt: "desc" },
        take: 30,
        select: {
          guestId: true,
          checkedItems: true,
          completedAt: true,
          verifiedAt: true,
          guest: { select: { name: true, email: true } },
          verifiedByGuest: { select: { name: true } },
        },
      }),
      prisma.photoboothBingoProgress.findMany({
        where: { verifiedAt: { not: null } },
        orderBy: { verifiedAt: "desc" },
        take: 20,
        select: {
          guestId: true,
          checkedItems: true,
          completedAt: true,
          verifiedAt: true,
          guest: { select: { name: true, email: true } },
          verifiedByGuest: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      pending: pending.map(serializeProgress),
      verified: verified.map(serializeProgress),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[bingo/mc GET]", error);
    return jsonError("Failed to load bingo verification queue.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const mc = await requireMcOrAdminAccess();
    const body = await request.json();
    const guestId = (body.guestId ?? "").trim();

    if (!guestId) {
      return jsonError("Guest id is required.", 400);
    }

    const progress = await prisma.photoboothBingoProgress.findUnique({
      where: { guestId },
      include: { guest: { select: { name: true } } },
    });

    if (!progress?.completedAt) {
      return jsonError("This guest has not completed Photobooth Bingo yet.", 400);
    }

    if (progress.verifiedAt) {
      return jsonError("This bingo card is already verified.", 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.photoboothBingoProgress.update({
        where: { guestId },
        data: {
          verifiedAt: new Date(),
          verifiedByGuestId: mc.id,
        },
        select: {
          guestId: true,
          checkedItems: true,
          completedAt: true,
          verifiedAt: true,
          guest: { select: { name: true, email: true } },
          verifiedByGuest: { select: { name: true } },
        },
      });

      await tx.inAppNotification.create({
        data: {
          guestId,
          title: "Bingo verified!",
          body: `${mc.name} verified your Photobooth Bingo win. You're officially crowned, darling!`,
          imageUrl: ANNITA_NOTIFICATION_ICON,
        },
      });

      return row;
    });

    return NextResponse.json({
      verified: serializeProgress(updated),
      message: `${progress.guest.name} verified.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[bingo/mc POST]", error);
    return jsonError("Failed to verify bingo winner.", 500);
  }
}
