import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { listTransferMatchesForGuest, respondToTransferMatch } from "@/lib/transfer-match";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireGuestSession();
    const { id } = await context.params;
    const body = await request.json();
    const accept = body.accept === true;

    const result = await respondToTransferMatch(session.id, id, accept);
    if (!result.ok) return jsonError(result.error, result.status);

    const matches = await listTransferMatchesForGuest(session.id);
    return NextResponse.json({ matches });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
