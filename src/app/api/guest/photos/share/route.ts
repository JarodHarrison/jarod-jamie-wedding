import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { uploadGuestPhotoToDrive } from "@/lib/google-drive";
import {
  formatVisionFlags,
  isVisionModerationEnabled,
  moderateGuestPhoto,
} from "@/lib/google-vision-moderation";
import { SHARED_PHOTO_ACCEPT, SHARED_PHOTO_MAX_BYTES } from "@/lib/kiosk";
import { prisma } from "@/lib/prisma";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function GET() {
  try {
    const session = await requireGuestSession();
    const photos = await prisma.guestSharedPhoto.findMany({
      where: { guestId: session.id, status: { not: "HIDDEN" } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        caption: true,
        createdAt: true,
        status: true,
        driveFileId: true,
      },
    });

    return NextResponse.json({
      photos: photos.map((photo) => ({
        ...photo,
        createdAt: photo.createdAt.toISOString(),
        imageUrl: `/api/guest/photos/share/${photo.id}`,
        savedToDrive: Boolean(photo.driveFileId),
      })),
      moderationEnabled: false,
      visionModerationEnabled: isVisionModerationEnabled(),
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireGuestSession();
    const formData = await request.formData();
    const file = formData.get("photo");
    const caption = (formData.get("caption") ?? "").toString().trim() || null;

    if (!(file instanceof File)) {
      return jsonError("Please choose a photo to upload.", 400);
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return jsonError(`Use a photo file (${SHARED_PHOTO_ACCEPT}).`, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > SHARED_PHOTO_MAX_BYTES) {
      return jsonError("Photo is too large — please use an image under 8MB.", 400);
    }

    const guest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: { name: true, email: true },
    });

    if (!guest) return jsonError("Guest not found.", 404);

    const moderation = await moderateGuestPhoto(buffer);

    const photo = await prisma.guestSharedPhoto.create({
      data: {
        guestId: session.id,
        mime: file.type,
        photoData: buffer,
        caption,
        status: moderation.status,
        visionSafeSearch: moderation.safeSearch ? formatVisionFlags(moderation.safeSearch) : undefined,
      },
      select: { id: true, caption: true, createdAt: true, status: true },
    });

    if (moderation.status === "HIDDEN") {
      return NextResponse.json({
        rejected: true,
        message: "That photo can't be added to the wall. Please choose a different image.",
      });
    }

    const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const safeName = guest.name.replace(/[^\w.-]+/g, "_").slice(0, 40);
    const fileName = `${safeName}-${photo.id.slice(-6)}.${extension}`;

    void uploadGuestPhotoToDrive({
      fileName,
      mime: file.type,
      buffer,
      guestName: guest.name,
      guestEmail: guest.email,
      caption,
    }).then(async (driveFileId) => {
      if (!driveFileId) return;
      await prisma.guestSharedPhoto.update({
        where: { id: photo.id },
        data: { driveFileId, driveUploadedAt: new Date() },
      });
    });

    const visionBorderline =
      moderation.enabled && moderation.scanned && moderation.decision === "review";

    return NextResponse.json({
      photo: {
        id: photo.id,
        caption: photo.caption,
        status: photo.status,
        createdAt: photo.createdAt.toISOString(),
        imageUrl: `/api/guest/photos/share/${photo.id}`,
      },
      pendingApproval: false,
      visionBorderline,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[guest/photos/share POST]", error);
    return jsonError("Failed to upload photo.", 500);
  }
}
