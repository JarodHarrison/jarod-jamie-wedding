import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import {
  createInAppNotifications,
  filterGuestsByAudience,
  isNotificationAudience,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const title = (body.title ?? "").trim();
    const message = (body.message ?? "").trim();
    const audience = (body.audience ?? "all") as string;

    if (!title) {
      return jsonError("Title is required.", 400);
    }
    if (!message) {
      return jsonError("Message is required.", 400);
    }
    if (!isNotificationAudience(audience)) {
      return jsonError("Invalid audience.", 400);
    }

    const guests = await prisma.guest.findMany({
      select: { id: true, rsvpStatus: true, tier: true },
    });

    const recipients = filterGuestsByAudience(guests, audience);
    if (recipients.length === 0) {
      return jsonError("No guests match this audience.", 400);
    }

    const sent = await createInAppNotifications(
      recipients.map((g) => g.id),
      title,
      message,
    );

    return NextResponse.json({
      sent,
      total: recipients.length,
      message: `In-app notification sent to ${sent} guest${sent === 1 ? "" : "s"}.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/push POST]", error);
    return jsonError("Failed to send notification.", 500);
  }
}
