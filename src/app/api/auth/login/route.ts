import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { jsonError, normalizeEmail } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";

    if (!email || !password) {
      return jsonError("Email and password are required.", 400);
    }

    const guest = await prisma.guest.findUnique({ where: { email } });
    if (guest) {
      const valid = await verifyPassword(password, guest.passwordHash);
      if (!valid) {
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
      });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return jsonError("Invalid email or password.", 401);
    }

    const adminValid = await verifyPassword(password, admin.passwordHash);
    if (!adminValid) {
      return jsonError("Invalid email or password.", 401);
    }

    await setSessionCookie({
      type: "admin",
      id: admin.id,
      name: admin.name,
      email: admin.email,
    });

    return NextResponse.json({
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch {
    return jsonError("Login failed.", 500);
  }
}
