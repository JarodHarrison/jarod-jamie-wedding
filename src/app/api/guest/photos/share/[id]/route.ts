import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { binaryPhotoResponse } from "@/lib/photo-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getSession();

  const photo = await prisma.guestSharedPhoto.findUnique({
    where: { id },
    select: { mime: true, photoData: true, status: true, guestId: true },
  });

  if (!photo?.photoData || !photo.mime) {
    return new NextResponse(null, { status: 404 });
  }

  const isOwner = session?.type === "guest" && session.id === photo.guestId;
  const isAdmin = session?.type === "admin";
  if (photo.status !== "APPROVED" && !isOwner && !isAdmin) {
    return new NextResponse(null, { status: 404 });
  }

  return binaryPhotoResponse(
    photo.photoData,
    photo.mime,
    photo.status === "APPROVED" ? "public, max-age=3600" : "private, no-store",
  );
}
