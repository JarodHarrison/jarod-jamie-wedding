import { NextResponse } from "next/server";
import { buildPasswordFields } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { findClaimableGuestForSignup } from "@/lib/guest-claim";
import { guestProfileSelect, serializeGuestProfile } from "@/lib/guest-profile";
import { notifyRegistration } from "@/lib/registration-notify";
import { sendGuestWelcomeEmail } from "@/lib/guest-emails";
import { prisma } from "@/lib/prisma";

import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name ?? "").trim();
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!name || name.length < 2) {
      return jsonError("Please enter your full name.", 400);
    }
    if (!email || !isValidEmail(email)) {
      return jsonError("Please enter a valid email address.", 400);
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400);
    }

    const existing = await prisma.guest.findUnique({
      where: { email },
      select: { id: true, passwordPlaintext: true },
    });
    if (existing?.passwordPlaintext) {
      return jsonError("An account with this email already exists. Please sign in.", 409);
    }

    const passwordFields = await buildPasswordFields(password);

    let guest;

    if (existing && !existing.passwordPlaintext) {
      guest = await prisma.guest.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash: passwordFields.passwordHash,
          passwordPlaintext: passwordFields.passwordPlaintext,
        },
        select: guestProfileSelect,
      });
    } else {
      const claimable = await findClaimableGuestForSignup(name, email);

      guest = claimable
        ? await prisma.guest.update({
            where: { id: claimable.id },
            data: {
              name,
              email,
              passwordHash: passwordFields.passwordHash,
              passwordPlaintext: passwordFields.passwordPlaintext,
            },
            select: guestProfileSelect,
          })
        : await prisma.guest.create({
            data: {
              name,
              email,
              passwordHash: passwordFields.passwordHash,
              passwordPlaintext: passwordFields.passwordPlaintext,
              tier: "OFF_SITE",
            },
            select: guestProfileSelect,
          });
    }

    await setSessionCookie({
      type: "guest",
      id: guest.id,
      name: guest.name,
      email: guest.email,
      tier: guest.tier,
    });

    notifyRegistration("signup", serializeGuestProfile(guest));
    void sendGuestWelcomeEmail({ name: guest.name, email: guest.email });

    return NextResponse.json(
      {
        user: {
          id: guest.id,
          name: guest.name,
          email: guest.email,
          tier: guest.tier,
        },
      },
      { status: 201 },
    );
  } catch {
    return jsonError("Sign up failed. Please try again.", 500);
  }
}
