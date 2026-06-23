import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError, isValidGuestTier } from "@/lib/api-utils";
import { sendGuestUpdateEmail } from "@/lib/guest-emails";
import { prisma } from "@/lib/prisma";
import type { GuestTier } from "@/types/wedding";

type BroadcastAudience =
  | "all"
  | "accepted"
  | "pending-rsvp"
  | GuestTier;

function isBroadcastAudience(value: string): value is BroadcastAudience {
  return (
    value === "all" ||
    value === "accepted" ||
    value === "pending-rsvp" ||
    isValidGuestTier(value)
  );
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const subject = (body.subject ?? "").trim();
    const message = (body.message ?? "").trim();
    const audience = (body.audience ?? "all") as string;

    if (!subject) {
      return jsonError("Subject is required.", 400);
    }
    if (!message) {
      return jsonError("Message is required.", 400);
    }
    if (!isBroadcastAudience(audience)) {
      return jsonError("Invalid audience.", 400);
    }

    const guests = await prisma.guest.findMany({
      select: { name: true, email: true, rsvpStatus: true, tier: true },
      orderBy: { name: "asc" },
    });

    const recipients = guests.filter((guest) => {
      if (audience === "all") return true;
      if (audience === "accepted") return guest.rsvpStatus === "ACCEPTED";
      if (audience === "pending-rsvp") return guest.rsvpStatus === "PENDING";
      return guest.tier === audience;
    });

    if (recipients.length === 0) {
      return jsonError("No guests match this audience.", 400);
    }

    let sent = 0;
    let failed = 0;

    for (const guest of recipients) {
      const ok = await sendGuestUpdateEmail(guest, subject, message);
      if (ok) sent += 1;
      else failed += 1;
    }

    return NextResponse.json({
      sent,
      failed,
      total: recipients.length,
      message:
        failed === 0
          ? `Update sent to ${sent} guest${sent === 1 ? "" : "s"}.`
          : `Sent to ${sent} guest${sent === 1 ? "" : "s"}, ${failed} failed.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/broadcast POST]", error);
    return jsonError("Failed to send update.", 500);
  }
}
