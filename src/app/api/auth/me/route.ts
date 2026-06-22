import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null, admin: null });
  }

  if (session.type === "guest") {
    return NextResponse.json({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        tier: session.tier,
      },
      admin: null,
    });
  }

  return NextResponse.json({
    user: null,
    admin: { id: session.id, name: session.name, email: session.email },
  });
}
