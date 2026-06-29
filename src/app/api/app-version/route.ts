import { NextResponse } from "next/server";
import { APP_BUILD_ID } from "@/lib/app-build-id";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { buildId: APP_BUILD_ID },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
