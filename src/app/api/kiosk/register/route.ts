import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import {
  generateKioskDisplayCode,
  generateKioskFeedToken,
} from "@/lib/kiosk";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const displayCode = generateKioskDisplayCode();
    const feedToken = generateKioskFeedToken();

    const session = await prisma.kioskSession.create({
      data: {
        displayCode,
        feedToken,
        status: "PENDING",
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const activateUrl = `${baseUrl}/kiosk/activate?code=${session.displayCode}`;

    return NextResponse.json({
      displayCode: session.displayCode,
      feedToken: session.feedToken,
      activateUrl,
    });
  } catch (error) {
    console.error("[kiosk/register]", error);
    return jsonError("Failed to start kiosk session.", 500);
  }
}
