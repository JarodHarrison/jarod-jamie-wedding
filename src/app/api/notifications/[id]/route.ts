import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const session = await requireGuestSession();
    const { id } = await context.params;

    const notification = await prisma.inAppNotification.findFirst({
      where: { id, guestId: session.id },
    });

    if (!notification) {
      return jsonError("Notification not found.", 404);
    }

    await prisma.inAppNotification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[notifications PATCH]", error);
    return jsonError("Failed to update notification.", 500);
  }
}
