import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-utils";
import { buildShuttleLiveState } from "@/lib/shuttle/live-state";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonError("Please sign in to view the live shuttle.", 401);
  }

  const state = await buildShuttleLiveState();
  return NextResponse.json(state);
}
