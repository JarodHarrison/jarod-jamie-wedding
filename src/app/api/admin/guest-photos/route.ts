import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { visionSummary } from "@/lib/google-vision-moderation";
import { prisma } from "@/lib/prisma";
import type { VisionSafeSearchResult } from "@/lib/google-vision-moderation";

function parseVisionSafeSearch(value: unknown): VisionSafeSearchResult | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.adult !== "string") return null;
  return record as unknown as VisionSafeSearchResult;
}

export async function GET() {
  try {
    await requireAdminAccess();

    const photos = await prisma.guestSharedPhoto.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        caption: true,
        status: true,
        mime: true,
        driveFileId: true,
        visionSafeSearch: true,
        createdAt: true,
        guest: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      photos: photos.map((photo) => {
        const vision = parseVisionSafeSearch(photo.visionSafeSearch);
        return {
          id: photo.id,
          caption: photo.caption,
          status: photo.status,
          mime: photo.mime,
          driveFileId: photo.driveFileId,
          guestName: photo.guest.name,
          guestEmail: photo.guest.email,
          createdAt: photo.createdAt.toISOString(),
          imageUrl: `/api/guest/photos/share/${photo.id}`,
          visionSummary: visionSummary(vision),
        };
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load guest photos.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const id = (body.id ?? "").toString();
    const action = (body.action ?? "").toString();

    if (!id) return jsonError("Photo id is required.", 400);

    if (action === "delete") {
      await prisma.guestSharedPhoto.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    if (action === "approve") {
      const photo = await prisma.guestSharedPhoto.update({
        where: { id },
        data: { status: "APPROVED" },
      });
      return NextResponse.json({ photo });
    }

    if (action === "hide") {
      const photo = await prisma.guestSharedPhoto.update({
        where: { id },
        data: { status: "HIDDEN" },
      });
      return NextResponse.json({ photo });
    }

    return jsonError("Invalid action.", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to update photo.", 500);
  }
}
