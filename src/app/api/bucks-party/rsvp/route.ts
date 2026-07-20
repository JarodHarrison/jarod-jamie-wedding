import { NextResponse } from "next/server";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { isBucksBudgetChoice } from "@/lib/bucks-party";
import { serializeBucksRsvp } from "@/lib/bucks-party-server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const attending = body.attending === true;
    const plusOneName =
      typeof body.plusOneName === "string" && body.plusOneName.trim()
        ? body.plusOneName.trim()
        : null;
    const commsConsent = body.commsConsent === true;
    const budgetChoice = body.budgetChoice;

    if (!name) return jsonError("Name is required.", 400);
    if (!emailRaw.trim()) return jsonError("Email is required.", 400);
    if (!phone) return jsonError("Mobile number is required for SMS updates.", 400);
    if (typeof body.attending !== "boolean") {
      return jsonError("Please choose whether you are coming.", 400);
    }
    if (!commsConsent) {
      return jsonError("Please agree to receive details by email and SMS.", 400);
    }

    const email = normalizeEmail(emailRaw);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Enter a valid email address.", 400);
    }

    let budget: number | null = null;
    if (attending) {
      if (!isBucksBudgetChoice(budgetChoice)) {
        return jsonError("Please choose a budget range.", 400);
      }
      budget = budgetChoice;
    }

    const guest = await prisma.guest.findFirst({
      where: {
        OR: [{ email }, { linkedLogins: { some: { email } } }],
      },
      select: { id: true },
    });

    const row = await prisma.bucksPartyRsvp.upsert({
      where: { email },
      create: {
        name,
        email,
        phone,
        attending,
        plusOneName: attending ? plusOneName : null,
        budgetChoice: budget,
        commsConsent: true,
        source: "PUBLIC",
        guestId: guest?.id ?? null,
      },
      update: {
        name,
        phone,
        attending,
        plusOneName: attending ? plusOneName : null,
        budgetChoice: budget,
        commsConsent: true,
        guestId: guest?.id ?? undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      rsvp: serializeBucksRsvp(row),
      message: attending
        ? "You're in. We'll send details by email and SMS."
        : "RSVP saved. We'll miss you!",
    });
  } catch (error) {
    console.error("Bucks RSVP error:", error);
    return jsonError("Could not save your RSVP. Please try again.", 500);
  }
}
