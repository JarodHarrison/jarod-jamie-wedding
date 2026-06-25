import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { resolveUploadImageMime } from "@/lib/detect-image-mime";
import { PROFILE_PHOTO_ACCEPT, PROFILE_PHOTO_MAX_BYTES } from "@/lib/guest-identity";
import { guestProfileSelect, serializeGuestProfile } from "@/lib/guest-profile";
import {
  isVisionBlockedPhoto,
  moderateGuestPhoto,
  PROFILE_PHOTO_VISION_REJECTION,
} from "@/lib/google-vision-moderation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 30;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(request: Request) {
  try {
    const session = await requireGuestSession();
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId")?.trim() || session.id;

    if (guestId !== session.id) {
      const target = await prisma.guest.findUnique({
        where: { id: guestId },
        select: { companionPhotoMime: true, companionPhotoData: true, rsvpStatus: true },
      });
      if (!target?.companionPhotoData || !target.companionPhotoMime || target.rsvpStatus !== "ACCEPTED") {
        return new NextResponse(null, { status: 404 });
      }
      return new NextResponse(Buffer.from(target.companionPhotoData), {
        headers: {
          "Content-Type": target.companionPhotoMime,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const guest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: { companionPhotoMime: true, companionPhotoData: true },
    });

    if (!guest?.companionPhotoData || !guest.companionPhotoMime) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(Buffer.from(guest.companionPhotoData), {
      headers: {
        "Content-Type": guest.companionPhotoMime,
        "Cache-Control": "private, max-age=3600",
      },
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

    if (!(file instanceof File)) {
      return jsonError("Please choose a photo to upload.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > PROFILE_PHOTO_MAX_BYTES) {
      return jsonError("Photo is too large — please use an image under 750KB.", 400);
    }

    const mime = resolveUploadImageMime(file, buffer);
    if (!mime || !ALLOWED_MIME.has(mime)) {
      return jsonError(`Use a photo file (${PROFILE_PHOTO_ACCEPT}).`, 400);
    }

    const moderation = await moderateGuestPhoto(buffer);
    if (isVisionBlockedPhoto(moderation)) {
      return NextResponse.json({
        rejected: true,
        message: PROFILE_PHOTO_VISION_REJECTION,
      });
    }

    const guest = await prisma.guest.update({
      where: { id: session.id },
      data: {
        companionPhotoMime: mime,
        companionPhotoData: buffer,
        profileUpdatedAt: new Date(),
      },
      select: guestProfileSelect,
    });

    return NextResponse.json({ profile: serializeGuestProfile(guest) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to upload companion photo.", 500);
  }
}

export async function DELETE() {
  try {
    const session = await requireGuestSession();
    const guest = await prisma.guest.update({
      where: { id: session.id },
      data: {
        companionPhotoMime: null,
        companionPhotoData: null,
        profileUpdatedAt: new Date(),
      },
      select: guestProfileSelect,
    });
    return NextResponse.json({ profile: serializeGuestProfile(guest) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to remove companion photo.", 500);
  }
}
