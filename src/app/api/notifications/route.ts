import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireGuestSession();
    const notifications = await prisma.inAppNotification.findMany({
      where: { guestId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        readAt: true,
        createdAt: true,
      },
    });

    const unreadCount = notifications.filter((n) => !n.readAt).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[notifications GET]", error);
    return jsonError("Failed to load notifications.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireGuestSession();
    const body = await request.json().catch(() => ({}));

    if (body.action === "read-all") {
      await prisma.inAppNotification.updateMany({
        where: { guestId: session.id, readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    return jsonError("Invalid action.", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[notifications POST]", error);
    return jsonError("Failed to update notifications.", 500);
  }
}
