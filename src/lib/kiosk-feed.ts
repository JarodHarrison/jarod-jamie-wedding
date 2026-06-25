import type { KioskSlide } from "@/lib/kiosk";
import { fetchHashtagPhotos, WEDDING_HASHTAG } from "@/lib/photos";
import { prisma } from "@/lib/prisma";

export async function buildKioskSlides(): Promise<KioskSlide[]> {
  const [stories, sharedPhotos, profileGuests, hashtagPhotos] = await Promise.all([
    prisma.guestStory.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        content: true,
        mood: true,
        isAnonymous: true,
        guestId: true,
        guest: {
          select: {
            name: true,
            profilePhotoMime: true,
          },
        },
      },
    }),
    prisma.guestSharedPhoto.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        caption: true,
        guest: { select: { name: true } },
      },
    }),
    prisma.guest.findMany({
      where: {
        rsvpStatus: "ACCEPTED",
        profilePhotoMime: { not: null },
      },
      orderBy: { profileUpdatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        name: true,
        guestOfHost: true,
      },
    }),
    fetchHashtagPhotos(),
  ]);

  const slides: KioskSlide[] = [];

  for (const story of stories) {
    const name = story.isAnonymous ? "A guest" : story.guest.name;
    slides.push({
      id: `story-${story.id}`,
      kind: "story",
      imageUrl: story.guest.profilePhotoMime
        ? `/api/guest/profile/photo?guestId=${story.guestId}`
        : "/kiosk/default-guest.svg",
      name,
      text: story.content,
      mood: story.mood,
    });
  }

  for (const photo of sharedPhotos) {
    slides.push({
      id: `shared-${photo.id}`,
      kind: "shared-photo",
      imageUrl: `/api/guest/photos/share/${photo.id}`,
      name: photo.guest.name,
      text: photo.caption?.trim() || "Shared a moment from the wedding",
      mood: null,
    });
  }

  for (const photo of hashtagPhotos) {
    slides.push({
      id: `hashtag-${photo.id}`,
      kind: "hashtag",
      imageUrl: photo.mediaUrl,
      name: `#${WEDDING_HASHTAG}`,
      text: "Shared on Instagram",
      mood: null,
      externalUrl: photo.permalink,
    });
  }

  for (const guest of profileGuests) {
    if (slides.some((slide) => slide.id === `profile-${guest.id}`)) continue;
    slides.push({
      id: `profile-${guest.id}`,
      kind: "profile-photo",
      imageUrl: `/api/guest/profile/photo?guestId=${guest.id}`,
      name: guest.name,
      text: guest.guestOfHost
        ? `Guest of ${guest.guestOfHost === "jarod" ? "Jarod" : guest.guestOfHost === "jamie" ? "Jamie" : "Jarod & Jamie"}`
        : "With love from the guest wall",
      mood: null,
    });
  }

  return slides;
}
