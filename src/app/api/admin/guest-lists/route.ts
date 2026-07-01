import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import type { GuestStatCategory } from "@/lib/admin-guest-stat-lists";
import { prisma } from "@/lib/prisma";

const SERVER_CATEGORIES = new Set<GuestStatCategory>([
  "bingo-playing",
  "bingo-done",
  "story-authors",
]);

export async function GET(request: Request) {
  try {
    await requireAdminAccess();

    const category = new URL(request.url).searchParams.get("category") as GuestStatCategory | null;
    if (!category || !SERVER_CATEGORIES.has(category)) {
      return jsonError("Invalid guest list category.", 400);
    }

    let guests: { id: string; name: string }[] = [];

    if (category === "bingo-playing") {
      const rows = await prisma.photoboothBingoProgress.findMany({
        where: { NOT: { checkedItems: { equals: [] } } },
        select: { guest: { select: { id: true, name: true } } },
        orderBy: { guest: { name: "asc" } },
      });
      guests = rows.map((row) => row.guest);
    } else if (category === "bingo-done") {
      const rows = await prisma.photoboothBingoProgress.findMany({
        where: { completedAt: { not: null } },
        select: { guest: { select: { id: true, name: true } } },
        orderBy: { guest: { name: "asc" } },
      });
      guests = rows.map((row) => row.guest);
    } else if (category === "story-authors") {
      const rows = await prisma.guestStory.findMany({
        distinct: ["guestId"],
        select: { guest: { select: { id: true, name: true } } },
        orderBy: { guest: { name: "asc" } },
      });
      guests = rows.map((row) => row.guest);
    }

    return NextResponse.json({ guests });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load guest list.", 500);
  }
}
