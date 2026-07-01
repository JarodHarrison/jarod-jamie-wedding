import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { loadSeatingChart } from "@/lib/seating-chart";
import { isWeddingFeatureVisible } from "@/lib/wedding-event";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireGuestSession();

    if (!isWeddingFeatureVisible("seating-chart")) {
      return jsonError("Seating chart is not available yet.", 403);
    }

    const guest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: { rsvpStatus: true },
    });

    if (!guest || guest.rsvpStatus !== "ACCEPTED") {
      return jsonError("Seating is only available for attending guests.", 403);
    }

    const chart = await loadSeatingChart(session.id);
    return NextResponse.json(chart);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
