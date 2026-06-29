import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { listTransferMatchesForGuest } from "@/lib/transfer-match";

export async function GET() {
  try {
    const session = await requireGuestSession();
    const matches = await listTransferMatchesForGuest(session.id);
    return NextResponse.json({ matches });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
