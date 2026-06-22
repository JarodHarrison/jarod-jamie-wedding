import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { getAppUrl, sendPasswordResetEmail } from "@/lib/guest-emails";
import { prisma } from "@/lib/prisma";

const RESET_EXPIRY_MS = 60 * 60 * 1000;

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a password reset link. Check your inbox.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email ?? "");

    if (!email) {
      return jsonError("Please enter your email address.", 400);
    }

    const guest = await prisma.guest.findUnique({ where: { email } });

    if (guest) {
      await prisma.guestPasswordResetToken.updateMany({
        where: { guestId: guest.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

      await prisma.guestPasswordResetToken.create({
        data: { guestId: guest.id, token, expiresAt },
      });

      const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
      await sendPasswordResetEmail({
        name: guest.name,
        email: guest.email,
        resetUrl,
      });
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }
}
