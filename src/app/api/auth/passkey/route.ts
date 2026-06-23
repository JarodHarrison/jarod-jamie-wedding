import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const passkeys = await prisma.passkeyCredential.findMany({
    where: session.type === "guest" ? { guestId: session.id } : { adminId: session.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nickname: true,
      deviceType: true,
      backedUp: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  return NextResponse.json({
    passkeys: passkeys.map((passkey) => ({
      ...passkey,
      createdAt: passkey.createdAt.toISOString(),
      lastUsedAt: passkey.lastUsedAt?.toISOString() ?? null,
    })),
  });
}
