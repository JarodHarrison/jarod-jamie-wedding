import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { buildDriveConnectUrl, createDriveOAuthState } from "@/lib/google-drive";

export async function GET() {
  try {
    await requireAdminAccess();

    if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
      return jsonError("GOOGLE_CLIENT_ID is not configured.", 500);
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const state = await createDriveOAuthState();
    const url = buildDriveConnectUrl(origin, state);

    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to start Google Drive connection.", 500);
  }
}
