import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { requireBucksPartyAccess } from "@/lib/auth/bucks-party-access";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { bucksPartyShareUrl, isBucksBudgetChoice } from "@/lib/bucks-party";
import {
  parseBucksPartyEventUpdate,
} from "@/lib/bucks-party-config";
import {
  getBucksPartyConfig,
  updateBucksPartyConfig,
} from "@/lib/bucks-party-config-server";
import { getBucksPartyStripeUrl, isBucksPartyStripeLive } from "@/lib/bucks-party-stripe";
import {
  bucksRsvpStats,
  serializeBucksRsvp,
} from "@/lib/bucks-party-server";
import { prisma } from "@/lib/prisma";

async function listPayload(origin?: string) {
  const rows = await prisma.bucksPartyRsvp.findMany({
    orderBy: [{ attending: "desc" }, { name: "asc" }],
  });
  const rsvps = rows.map(serializeBucksRsvp);
  const organisers = await prisma.guest.findMany({
    where: { isBucksPartyAdmin: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  const event = await getBucksPartyConfig();

  return {
    rsvps,
    stats: bucksRsvpStats(rsvps),
    organisers,
    event,
    shareUrl: bucksPartyShareUrl(origin),
    stripeLive: isBucksPartyStripeLive(),
    stripeUrl: getBucksPartyStripeUrl(),
  };
}

export async function GET(request: Request) {
  try {
    await requireBucksPartyAccess();
    const origin = new URL(request.url).origin;
    return NextResponse.json(await listPayload(origin));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load bucks party data.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireBucksPartyAccess();
    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "link-guest") {
      const guestId = typeof body.guestId === "string" ? body.guestId : "";
      if (!guestId) return jsonError("Guest id required.", 400);

      const guest = await prisma.guest.findUnique({
        where: { id: guestId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          plusOneName: true,
        },
      });
      if (!guest) return jsonError("Guest not found.", 404);

      const email = normalizeEmail(guest.email);
      const phone = guest.phone?.trim() || "TBC";
      const attending = body.attending !== false;

      const row = await prisma.bucksPartyRsvp.upsert({
        where: { email },
        create: {
          name: guest.name,
          email,
          phone,
          attending,
          plusOneName: guest.plusOneName,
          budgetChoice: null,
          commsConsent: true,
          source: "ADMIN_LINK",
          guestId: guest.id,
        },
        update: {
          name: guest.name,
          phone: guest.phone?.trim() || undefined,
          attending,
          plusOneName: guest.plusOneName,
          source: "ADMIN_LINK",
          guestId: guest.id,
        },
      });

      return NextResponse.json({ ok: true, rsvp: serializeBucksRsvp(row) });
    }

    if (action === "patch") {
      const id = typeof body.id === "string" ? body.id : "";
      if (!id) return jsonError("RSVP id required.", 400);

      const data: {
        attending?: boolean;
        prepaidNotedAt?: Date | null;
        prepaidNotes?: string | null;
        plusOneName?: string | null;
        budgetChoice?: number | null;
        phone?: string;
      } = {};

      if (typeof body.attending === "boolean") data.attending = body.attending;
      if (typeof body.phone === "string" && body.phone.trim()) data.phone = body.phone.trim();
      if (typeof body.plusOneName === "string") {
        data.plusOneName = body.plusOneName.trim() || null;
      }
      if (body.budgetChoice === null) data.budgetChoice = null;
      else if (isBucksBudgetChoice(body.budgetChoice)) data.budgetChoice = body.budgetChoice;

      if (typeof body.prepaid === "boolean") {
        data.prepaidNotedAt = body.prepaid ? new Date() : null;
        if (!body.prepaid) data.prepaidNotes = null;
      }
      if (typeof body.prepaidNotes === "string") {
        data.prepaidNotes = body.prepaidNotes.trim() || null;
      }

      const row = await prisma.bucksPartyRsvp.update({
        where: { id },
        data,
      });
      return NextResponse.json({ ok: true, rsvp: serializeBucksRsvp(row) });
    }

    if (action === "set-organiser") {
      await requireAdminAccess();
      const guestId = typeof body.guestId === "string" ? body.guestId : "";
      const enabled = body.enabled === true;
      if (!guestId) return jsonError("Guest id required.", 400);

      const guest = await prisma.guest.update({
        where: { id: guestId },
        data: { isBucksPartyAdmin: enabled },
        select: { id: true, name: true, email: true, isBucksPartyAdmin: true },
      });
      return NextResponse.json({ ok: true, guest });
    }

    if (action === "update-event") {
      const parsed = parseBucksPartyEventUpdate(body);
      if (parsed.error) return jsonError(parsed.error, 400);

      const updatedByGuestId = session.type === "guest" ? session.id : undefined;
      const event = await updateBucksPartyConfig(parsed.data, updatedByGuestId);
      revalidatePath("/Bucksparty");
      revalidatePath("/api/bucks-party/config");
      return NextResponse.json({ ok: true, event });
    }

    return jsonError("Unknown action.", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("Bucks organiser POST error:", error);
    return jsonError("Failed to update bucks party data.", 500);
  }
}
