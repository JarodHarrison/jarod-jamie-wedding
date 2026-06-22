import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {
    authSecret: process.env.AUTH_SECRET ? "set" : "missing",
    databaseUrl: process.env.DATABASE_URL ? "set" : "missing",
    directUrl: process.env.DIRECT_URL ? "set" : "missing",
  };

  try {
    const adminCount = await prisma.admin.count();
    return NextResponse.json({ ok: true, checks, adminCount });
  } catch (error) {
    console.error("[health]", error);
    return NextResponse.json(
      {
        ok: false,
        checks,
        error: error instanceof Error ? error.message : "Database unreachable",
      },
      { status: 503 },
    );
  }
}
