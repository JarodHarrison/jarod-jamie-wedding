import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { resolveUploadImageMime } from "@/lib/detect-image-mime";
import { guestProfileSelect, serializeGuestProfile } from "@/lib/guest-profile";
import { PROFILE_PHOTO_ACCEPT, PROFILE_PHOTO_MAX_BYTES } from "@/lib/guest-identity";
import { binaryPhotoResponse } from "@/lib/photo-response";
import { notifyRegistration } from "@/lib/registration-notify";
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
        select: { profilePhotoMime: true, profilePhotoData: true, rsvpStatus: true },
      });
      if (!target?.profilePhotoData || !target.profilePhotoMime || target.rsvpStatus !== "ACCEPTED") {
        return new NextResponse(null, { status: 404 });
      }
      return binaryPhotoResponse(target.profilePhotoData, target.profilePhotoMime, "public, max-age=86400");
    }

    const guest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: { profilePhotoMime: true, profilePhotoData: true },
    });

    if (!guest?.profilePhotoData || !guest.profilePhotoMime) {
      return new NextResponse(null, { status: 404 });
    }

    return binaryPhotoResponse(guest.profilePhotoData, guest.profilePhotoMime, "private, max-age=3600");
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

    const guest = await prisma.guest.update({
      where: { id: session.id },
      data: {
        profilePhotoMime: mime,
        profilePhotoData: buffer,
        profileUpdatedAt: new Date(),
      },
      select: guestProfileSelect,
    });

    const profile = serializeGuestProfile(guest);
    notifyRegistration("identity", profile);

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[guest/profile/photo POST]", error);
    return jsonError("Failed to upload photo.", 500);
  }
}

export async function DELETE() {
  try {
    const session = await requireGuestSession();

    const guest = await prisma.guest.update({
      where: { id: session.id },
      data: {
        profilePhotoMime: null,
        profilePhotoData: null,
        profileUpdatedAt: new Date(),
      },
      select: guestProfileSelect,
    });

    return NextResponse.json({ profile: serializeGuestProfile(guest) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to remove photo.", 500);
  }
}
