import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const driverId = body.driverId as string | undefined;

    const driver = driverId
      ? await prisma.driver.findUnique({ where: { id: driverId } })
      : await prisma.driver.findFirst({ orderBy: { createdAt: "asc" } });

    if (!driver) {
      return jsonError("No driver configured.", 404);
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.driverMagicToken.create({
      data: { driverId: driver.id, token, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const url = `${baseUrl}/driver?token=${token}`;

    return NextResponse.json({ url, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to create magic link.", 500);
  }
}
