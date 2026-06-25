import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { GUEST_STORY_AUTO_HIDE_REPORTS } from "@/lib/guest-stories";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    await requireGuestSession();
    const { id } = await context.params;

    const story = await prisma.guestStory.findUnique({ where: { id } });
    if (!story) return jsonError("Story not found.", 404);

    const updated = await prisma.guestStory.update({
      where: { id },
      data: {
        reportCount: { increment: 1 },
        ...(story.reportCount + 1 >= GUEST_STORY_AUTO_HIDE_REPORTS
          ? { status: "HIDDEN" }
          : {}),
      },
    });

    return NextResponse.json({
      ok: true,
      hidden: updated.status === "HIDDEN",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to report story.", 500);
  }
}
