import { fetchHashtagPhotos, WEDDING_HASHTAG } from "@/lib/photos";
import { prisma } from "@/lib/prisma";
import type { WallPhoto } from "@/types/wall-photo";

export type { WallPhoto };

export async function fetchWeddingWallPhotos(options?: { uploadsOnlyApproved?: boolean }) {
  const uploadsOnlyApproved = options?.uploadsOnlyApproved ?? true;

  const [hashtagPhotos, uploads] = await Promise.all([
    fetchHashtagPhotos(),
    prisma.guestSharedPhoto.findMany({
      where: uploadsOnlyApproved ? { status: "APPROVED" } : undefined,
      orderBy: { createdAt: "desc" },
      take: 48,
      select: {
        id: true,
        caption: true,
        mime: true,
        createdAt: true,
        guest: { select: { name: true } },
      },
    }),
  ]);

  const uploadItems: WallPhoto[] = uploads.map((photo) => ({
    id: `upload-${photo.id}`,
    source: "upload",
    mediaUrl: `/api/guest/photos/share/${photo.id}`,
    permalink: null,
    mediaType: photo.mime.startsWith("image/") ? "IMAGE" : "IMAGE",
    caption: photo.caption,
    guestName: photo.guest.name,
    createdAt: photo.createdAt.toISOString(),
  }));

  const hashtagItems: WallPhoto[] = hashtagPhotos.map((photo) => ({
    id: `hashtag-${photo.id}`,
    source: "hashtag",
    mediaUrl: photo.mediaUrl,
    permalink: photo.permalink,
    mediaType: photo.mediaType,
    caption: `#${WEDDING_HASHTAG}`,
    guestName: "Instagram",
    createdAt: new Date().toISOString(),
  }));

  return [...uploadItems, ...hashtagItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
