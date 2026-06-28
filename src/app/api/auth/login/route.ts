import { NextResponse } from "next/server";
import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { guestIsMcOrAdmin } from "@/lib/auth/mc-access";
import { isAdminPreferredEmail, isGuestOnlyEmail } from "@/lib/auth/account-roles";
import { createAdminSessionResponse } from "@/lib/auth/create-session";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

const guestLoginSelect = {
  id: true,
  name: true,
  email: true,
  tier: true,
  isMc: true,
  passwordHash: true,
} as const;

const adminLoginSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!email || !password) {
      return jsonError("Email and password are required.", 400);
    }

    const [guest, admin] = await Promise.all([
      prisma.guest.findUnique({ where: { email }, select: guestLoginSelect }),
      prisma.admin.findUnique({ where: { email }, select: adminLoginSelect }),
    ]);

    const guestValid = guest ? await verifyPassword(password, guest.passwordHash) : false;
    const adminValid = admin ? await verifyPassword(password, admin.passwordHash) : false;

    if (isGuestOnlyEmail(email)) {
      if (!guest || !guestValid) {
        return jsonError("Invalid email or password.", 401);
      }

      await setSessionCookie({
        type: "guest",
        id: guest.id,
        name: guest.name,
        email: guest.email,
        tier: guest.tier,
      });

      return NextResponse.json({
        user: {
          id: guest.id,
          name: guest.name,
          email: guest.email,
          tier: guest.tier,
        },
        canAccessAdmin: false,
        canVerifyBingo: await guestIsMcOrAdmin(guest.email, guest.isMc),
      });
    }

    if (isAdminPreferredEmail(email) && admin && adminValid) {
      return createAdminSessionResponse(admin);
    }

    // Prefer a guest session when both exist so RSVP/forms keep working.
    if (guest && guestValid) {
      await setSessionCookie({
        type: "guest",
        id: guest.id,
        name: guest.name,
        email: guest.email,
        tier: guest.tier,
      });

      const canAccessAdmin = admin ? true : await guestHasAdminAccess(guest.email);
      const canVerifyBingo = await guestIsMcOrAdmin(guest.email, guest.isMc);

      return NextResponse.json({
        user: {
          id: guest.id,
          name: guest.name,
          email: guest.email,
          tier: guest.tier,
        },
        canAccessAdmin,
        canVerifyBingo,
      });
    }

    if (admin && adminValid) {
      return createAdminSessionResponse(admin);
    }

    return jsonError("Invalid email or password.", 401);
  } catch (error) {
    console.error("[login]", error);
    return jsonError("Login failed.", 500);
  }
}
