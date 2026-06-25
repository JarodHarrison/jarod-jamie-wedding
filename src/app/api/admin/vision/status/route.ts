import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import {
  isVisionModerationEnabled,
  verifyVisionApiAccess,
} from "@/lib/google-vision-moderation";

export async function GET() {
  try {
    await requireAdminAccess();

    return NextResponse.json({
      configured: Boolean(process.env.GOOGLE_API_KEY?.trim()),
      enabled: isVisionModerationEnabled(),
      autoApproveCleanAndBorderline: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load Vision status.", 500);
  }
}

export async function POST() {
  try {
    await requireAdminAccess();

    const result = await verifyVisionApiAccess();
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.error ?? "Vision API check failed." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Cloud Vision API is reachable. Guest photo safe-search is active.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Vision API check failed.", 500);
  }
}
