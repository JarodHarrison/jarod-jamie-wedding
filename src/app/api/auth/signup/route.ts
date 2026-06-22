import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

const MIN_PASSWORD_LENGTH = 8;

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

    const existing = await prisma.guest.findUnique({ where: { email } });
    if (existing) {
      return jsonError("An account with this email already exists. Please sign in.", 409);
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        tier: "OFF_SITE",
      },
    });

    await setSessionCookie({
      type: "guest",
      id: guest.id,
      name: guest.name,
      email: guest.email,
      tier: guest.tier,
    });

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
