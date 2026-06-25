import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return jsonError("Missing kiosk token.", 400);
  }

  const session = await prisma.kioskSession.findUnique({
    where: { feedToken: token },
    select: {
      status: true,
      displayCode: true,
      activatedAt: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return jsonError("Kiosk session not found.", 404);
  }

  if (session.status === "ACTIVE" && session.expiresAt && session.expiresAt < new Date()) {
    await prisma.kioskSession.update({
      where: { feedToken: token },
      data: { status: "ENDED" },
    });
    return NextResponse.json({ status: "ENDED", displayCode: session.displayCode });
  }

  return NextResponse.json({
    status: session.status,
    displayCode: session.displayCode,
    activatedAt: session.activatedAt?.toISOString() ?? null,
    expiresAt: session.expiresAt?.toISOString() ?? null,
  });
}
