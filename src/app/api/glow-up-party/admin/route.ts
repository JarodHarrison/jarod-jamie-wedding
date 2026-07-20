import { NextResponse } from "next/server";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import {
  glowUpPartyShareUrl,
  isGlowUpInterestChoice,
  isGlowUpWhiteningPackage,
  wantsPumpParty,
  wantsWhitening,
} from "@/lib/glow-up-party";
import {
  glowUpInterestStats,
  serializeGlowUpInterest,
} from "@/lib/glow-up-party-server";
import { prisma } from "@/lib/prisma";

async function listPayload(origin?: string) {
  const rows = await prisma.glowUpPartyInterest.findMany({
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
  const interests = rows.map(serializeGlowUpInterest);
  return {
    interests,
    stats: glowUpInterestStats(interests),
    shareUrl: glowUpPartyShareUrl(origin),
  };
}

export async function GET(request: Request) {
  try {
    await requireAdminAccess();
    const origin = new URL(request.url).origin;
    return NextResponse.json(await listPayload(origin));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load glow-up party data.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "link-guest") {
      const guestId = typeof body.guestId === "string" ? body.guestId : "";
      if (!guestId) return jsonError("Guest id required.", 400);

      const interest = isGlowUpInterestChoice(body.interest) ? body.interest : "both";
      const guest = await prisma.guest.findUnique({
        where: { id: guestId },
        select: { id: true, name: true, email: true, phone: true },
      });
      if (!guest) return jsonError("Guest not found.", 404);

      const email = normalizeEmail(guest.email);
      const phone = guest.phone?.trim() || "TBC";

      const row = await prisma.glowUpPartyInterest.upsert({
        where: { email },
        create: {
          name: guest.name,
          email,
          phone,
          interest,
          whiteningPackage: wantsWhitening(interest) ? "WHITENING_ONLY" : null,
          botoxUnits: null,
          fillerMl: null,
          notes: null,
          commsConsent: true,
          source: "ADMIN_LINK",
          guestId: guest.id,
        },
        update: {
          name: guest.name,
          phone: guest.phone?.trim() || undefined,
          interest,
          source: "ADMIN_LINK",
          guestId: guest.id,
        },
      });

      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          glowUpInterest: interest,
          interestsSubmittedAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true, interest: serializeGlowUpInterest(row) });
    }

    if (action === "patch") {
      const id = typeof body.id === "string" ? body.id : "";
      if (!id) return jsonError("Interest id required.", 400);

      const data: {
        interest?: import("@/lib/glow-up-party").GlowUpInterestChoice;
        whiteningPackage?: import("@/lib/glow-up-party").GlowUpWhiteningPackage | null;
        botoxUnits?: number | null;
        fillerMl?: number | null;
        phone?: string;
        notes?: string | null;
      } = {};

      if (isGlowUpInterestChoice(body.interest)) data.interest = body.interest;
      if (body.whiteningPackage === null) data.whiteningPackage = null;
      else if (isGlowUpWhiteningPackage(body.whiteningPackage)) {
        data.whiteningPackage = body.whiteningPackage;
      }
      if (body.botoxUnits === null) data.botoxUnits = null;
      else if (typeof body.botoxUnits === "number" && Number.isFinite(body.botoxUnits)) {
        data.botoxUnits = Math.round(body.botoxUnits);
      }
      if (body.fillerMl === null) data.fillerMl = null;
      else if (typeof body.fillerMl === "number" && Number.isFinite(body.fillerMl)) {
        data.fillerMl = Math.round(body.fillerMl * 10) / 10;
      }
      if (typeof body.phone === "string" && body.phone.trim()) data.phone = body.phone.trim();
      if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

      const existing = await prisma.glowUpPartyInterest.findUnique({ where: { id } });
      if (!existing) return jsonError("Not found.", 404);

      const nextInterest = data.interest ?? existing.interest;
      if (!wantsWhitening(nextInterest)) data.whiteningPackage = null;
      if (!wantsPumpParty(nextInterest)) {
        data.botoxUnits = null;
        data.fillerMl = null;
      }

      const row = await prisma.glowUpPartyInterest.update({
        where: { id },
        data,
      });

      if (row.guestId && data.interest) {
        await prisma.guest.update({
          where: { id: row.guestId },
          data: { glowUpInterest: data.interest, interestsSubmittedAt: new Date() },
        });
      }

      return NextResponse.json({ ok: true, interest: serializeGlowUpInterest(row) });
    }

    return jsonError("Unknown action.", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("Glow-up admin POST error:", error);
    return jsonError("Failed to update glow-up party data.", 500);
  }
}
