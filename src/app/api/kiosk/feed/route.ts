import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { buildKioskSlides } from "@/lib/kiosk-feed";
import { KIOSK_SLIDE_SECONDS } from "@/lib/kiosk";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return jsonError("Missing kiosk token.", 400);
  }

  const session = await prisma.kioskSession.findUnique({
    where: { feedToken: token },
    select: { status: true, expiresAt: true },
  });

  if (!session || session.status !== "ACTIVE") {
    return jsonError("Kiosk is not active.", 403);
  }

  if (session.expiresAt && session.expiresAt < new Date()) {
    return jsonError("Kiosk session expired.", 403);
  }

  const slides = await buildKioskSlides();

  return NextResponse.json({
    slides,
    slideSeconds: KIOSK_SLIDE_SECONDS,
    refreshedAt: new Date().toISOString(),
  });
}
