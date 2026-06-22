import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { setDriverSessionCookie } from "@/lib/shuttle/driver-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = (body.token ?? "").toString().trim();

    if (!token) {
      return jsonError("Missing token.", 400);
    }

    const magic = await prisma.driverMagicToken.findUnique({
      where: { token },
      include: { driver: true },
    });

    if (!magic || magic.usedAt || magic.expiresAt < new Date()) {
      return jsonError("This link is invalid or has expired.", 401);
    }

    await prisma.driverMagicToken.update({
      where: { id: magic.id },
      data: { usedAt: new Date() },
    });

    await setDriverSessionCookie({
      type: "driver",
      id: magic.driver.id,
      name: magic.driver.name,
    });

    return NextResponse.json({
      driver: { id: magic.driver.id, name: magic.driver.name },
    });
  } catch {
    return jsonError("Login failed.", 500);
  }
}
