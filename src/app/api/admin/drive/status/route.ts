import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { isGoogleDriveConfigured } from "@/lib/google-drive";
import { isVisionModerationEnabled } from "@/lib/google-vision-moderation";

export async function GET() {
  try {
    await requireAdminAccess();

    return NextResponse.json({
      driveConnected: isGoogleDriveConfigured(),
      googleClientConfigured: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
      folderIdConfigured: Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()),
      autoApprovePhotos: true,
      visionModerationEnabled: isVisionModerationEnabled(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load Drive status.", 500);
  }
}
