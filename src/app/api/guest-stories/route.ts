import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import {
  GUEST_STORY_MAX_LENGTH,
  GUEST_STORY_MAX_PER_GUEST,
  GUEST_STORY_MIN_LENGTH,
  isGuestStoryMood,
  type GuestStoryItem,
} from "@/lib/guest-stories";
import { containsProfanity } from "@/lib/profanity";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireGuestSession();

    const stories = await prisma.guestStory.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        content: true,
        mood: true,
        isAnonymous: true,
        guestId: true,
        createdAt: true,
        guest: { select: { name: true } },
      },
    });

    const items: GuestStoryItem[] = stories.map((story) => ({
      id: story.id,
      content: story.content,
      mood: story.mood,
      displayName: story.isAnonymous ? null : story.guest.name,
      createdAt: story.createdAt.toISOString(),
      isMine: story.guestId === session.id,
    }));

    return NextResponse.json({ stories: items });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[guest-stories GET]", error);
    return jsonError("Failed to load stories.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireGuestSession();
    const body = await request.json();

    const content = (body.content ?? "").toString().trim();
    const mood = (body.mood ?? "").toString().trim();
    const isAnonymous = Boolean(body.isAnonymous);

    if (!isGuestStoryMood(mood)) {
      return jsonError("Pick a vibe for your story.", 400);
    }
    if (content.length < GUEST_STORY_MIN_LENGTH) {
      return jsonError(`Stories need at least ${GUEST_STORY_MIN_LENGTH} characters.`, 400);
    }
    if (content.length > GUEST_STORY_MAX_LENGTH) {
      return jsonError(`Keep it under ${GUEST_STORY_MAX_LENGTH} characters.`, 400);
    }
    if (containsProfanity(content)) {
      return jsonError("Please keep stories wedding-appropriate — edit and try again.", 400);
    }

    const existingCount = await prisma.guestStory.count({
      where: { guestId: session.id },
    });
    if (existingCount >= GUEST_STORY_MAX_PER_GUEST) {
      return jsonError(`You can share up to ${GUEST_STORY_MAX_PER_GUEST} stories.`, 400);
    }

    const story = await prisma.guestStory.create({
      data: {
        guestId: session.id,
        content,
        mood,
        isAnonymous,
        status: "APPROVED",
      },
      select: {
        id: true,
        content: true,
        mood: true,
        isAnonymous: true,
        guestId: true,
        createdAt: true,
        guest: { select: { name: true } },
      },
    });

    const item: GuestStoryItem = {
      id: story.id,
      content: story.content,
      mood: story.mood,
      displayName: story.isAnonymous ? null : story.guest.name,
      createdAt: story.createdAt.toISOString(),
      isMine: true,
    };

    return NextResponse.json({ story: item });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[guest-stories POST]", error);
    return jsonError("Failed to share story.", 500);
  }
}
