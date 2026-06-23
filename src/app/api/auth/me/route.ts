import { NextResponse } from "next/server";
import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null, admin: null, canAccessAdmin: false });
  }

  if (session.type === "guest") {
    const canAccessAdmin = await guestHasAdminAccess(session.email);
    return NextResponse.json({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        tier: session.tier,
      },
      admin: null,
      canAccessAdmin,
    });
  }

  return NextResponse.json({
    user: null,
    admin: { id: session.id, name: session.name, email: session.email },
    canAccessAdmin: true,
  });
}
