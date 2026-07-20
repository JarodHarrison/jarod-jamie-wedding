import { NextResponse } from "next/server";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import {
  glowUpInterestLabel,
  isGlowUpInterestChoice,
  isGlowUpWhiteningPackage,
  wantsPumpParty,
  wantsWhitening,
  type GlowUpWhiteningPackage,
} from "@/lib/glow-up-party";
import { serializeGlowUpInterest } from "@/lib/glow-up-party-server";
import { prisma } from "@/lib/prisma";

function parseNonNegNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const notes =
      typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 500) : null;
    const commsConsent = body.commsConsent === true;
    const interestRaw = body.interest;

    if (!name) return jsonError("Name is required.", 400);
    if (!emailRaw.trim()) return jsonError("Email is required.", 400);
    if (!phone) return jsonError("Mobile number is required for SMS updates.", 400);
    if (!isGlowUpInterestChoice(interestRaw)) {
      return jsonError("Please choose which glow-up you are interested in.", 400);
    }
    if (!commsConsent) {
      return jsonError("Please agree to receive details by email and SMS.", 400);
    }

    const email = normalizeEmail(emailRaw);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Enter a valid email address.", 400);
    }

    let whiteningPackage: GlowUpWhiteningPackage | null = null;
    if (wantsWhitening(interestRaw)) {
      if (!isGlowUpWhiteningPackage(body.whiteningPackage)) {
        return jsonError("Please choose whitening only or whitening with the Glow Kit.", 400);
      }
      whiteningPackage = body.whiteningPackage;
    }

    let botoxUnits: number | null = null;
    let fillerMl: number | null = null;
    if (wantsPumpParty(interestRaw)) {
      botoxUnits = parseNonNegNumber(body.botoxUnits);
      fillerMl = parseNonNegNumber(body.fillerMl);
      if (botoxUnits === null && fillerMl === null) {
        return jsonError("Tell us how many botox units and/or ml of filler you would like.", 400);
      }
      if (botoxUnits !== null) botoxUnits = Math.round(botoxUnits);
      if (fillerMl !== null) fillerMl = Math.round(fillerMl * 10) / 10;
    }

    const guest = await prisma.guest.findFirst({
      where: {
        OR: [{ email }, { linkedLogins: { some: { email } } }],
      },
      select: { id: true },
    });

    const row = await prisma.glowUpPartyInterest.upsert({
      where: { email },
      create: {
        name,
        email,
        phone,
        interest: interestRaw,
        whiteningPackage,
        botoxUnits,
        fillerMl,
        notes,
        commsConsent: true,
        source: "PUBLIC",
        guestId: guest?.id ?? null,
      },
      update: {
        name,
        phone,
        interest: interestRaw,
        whiteningPackage,
        botoxUnits,
        fillerMl,
        notes,
        commsConsent: true,
        guestId: guest?.id ?? undefined,
      },
    });

    if (guest?.id) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          glowUpInterest: interestRaw,
          interestsSubmittedAt: new Date(),
          phone: phone || undefined,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      interest: serializeGlowUpInterest(row),
      message: `You are on the list for ${glowUpInterestLabel(interestRaw)}. We will send details by email and SMS.`,
    });
  } catch (error) {
    console.error("Glow-up interest error:", error);
    return jsonError("Could not save your interest. Please try again.", 500);
  }
}
