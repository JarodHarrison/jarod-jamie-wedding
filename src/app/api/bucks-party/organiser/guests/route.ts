import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireBucksPartyAccess } from "@/lib/auth/bucks-party-access";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireBucksPartyAccess();
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) {
      return NextResponse.json({ guests: [] });
    }

    const guests = await prisma.guest.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: 16,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isBucksPartyAdmin: true,
      },
    });

    return NextResponse.json({ guests });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to search guests.", 500);
  }
}
