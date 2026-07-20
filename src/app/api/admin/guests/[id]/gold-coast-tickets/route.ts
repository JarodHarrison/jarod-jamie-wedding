import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { loadGuestGoldCoastTickets } from "@/lib/gold-coast-tickets-server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminAccess();
    const { id } = await context.params;

    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { id: true, tier: true },
    });

    if (!guest) {
      return jsonError("Guest not found.", 404);
    }

    const tickets = await loadGuestGoldCoastTickets(guest.id);
    return NextResponse.json({ tickets });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load tickets.", 500);
  }
}
