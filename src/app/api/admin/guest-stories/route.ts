import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminAccess();

    const stories = await prisma.guestStory.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        content: true,
        mood: true,
        isAnonymous: true,
        status: true,
        reportCount: true,
        createdAt: true,
        guest: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      stories: stories.map((story) => ({
        id: story.id,
        content: story.content,
        mood: story.mood,
        isAnonymous: story.isAnonymous,
        status: story.status,
        reportCount: story.reportCount,
        authorName: story.guest.name,
        authorEmail: story.guest.email,
        createdAt: story.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load stories.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const id = (body.id ?? "").toString();
    const action = (body.action ?? "").toString();

    if (!id) return jsonError("Story id required.", 400);

    if (action === "hide") {
      await prisma.guestStory.update({ where: { id }, data: { status: "HIDDEN" } });
      return NextResponse.json({ ok: true });
    }
    if (action === "approve") {
      await prisma.guestStory.update({
        where: { id },
        data: { status: "APPROVED", reportCount: 0 },
      });
      return NextResponse.json({ ok: true });
    }
    if (action === "delete") {
      await prisma.guestStory.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    return jsonError("Invalid action.", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to update story.", 500);
  }
}
