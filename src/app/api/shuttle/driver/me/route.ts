import { NextResponse } from "next/server";
import { clearDriverSessionCookie, getDriverSession } from "@/lib/shuttle/driver-session";
import { buildShuttleLiveState } from "@/lib/shuttle/live-state";
import { getActiveShuttleSession } from "@/lib/shuttle/service";

export async function GET() {
  const session = await getDriverSession();
  if (!session) {
    return NextResponse.json({ driver: null, activeSession: null });
  }

  const activeSession = await getActiveShuttleSession();
  const live = await buildShuttleLiveState();

  return NextResponse.json({
    driver: session,
    activeSession:
      activeSession && activeSession.driverId === session.id
        ? {
            id: activeSession.id,
            status: activeSession.status,
            startedAt: activeSession.startedAt.toISOString(),
          }
        : null,
    live,
  });
}

export async function DELETE() {
  await clearDriverSessionCookie();
  return NextResponse.json({ ok: true });
}
