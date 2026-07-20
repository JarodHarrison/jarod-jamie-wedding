import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { assertGuestCanViewGoldCoastTickets, loadGuestGoldCoastTickets } from "@/lib/gold-coast-tickets-server";

export async function GET() {
  try {
    const session = await requireGuestSession();
    await assertGuestCanViewGoldCoastTickets(session.id);
    const tickets = await loadGuestGoldCoastTickets(session.id);
    return NextResponse.json({ tickets });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return jsonError("Forbidden", 403);
    }
    return jsonError("Failed to load tickets.", 500);
  }
}
