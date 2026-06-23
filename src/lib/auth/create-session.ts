import { NextResponse } from "next/server";
import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { setSessionCookie } from "@/lib/auth/session";
import type { GuestTier } from "@/types/wedding";

type GuestAccount = {
  id: string;
  name: string;
  email: string;
  tier: GuestTier;
};

type AdminAccount = {
  id: string;
  name: string;
  email: string;
};

export async function setGuestSessionCookie(guest: GuestAccount) {
  await setSessionCookie({
    type: "guest",
    id: guest.id,
    name: guest.name,
    email: guest.email,
    tier: guest.tier,
  });
}

export async function setAdminSessionCookie(admin: AdminAccount) {
  await setSessionCookie({
    type: "admin",
    id: admin.id,
    name: admin.name,
    email: admin.email,
  });
}

export async function createGuestSessionResponse(guest: GuestAccount, hasAdminRecord = false) {
  await setGuestSessionCookie(guest);

  const canAccessAdmin = hasAdminRecord || (await guestHasAdminAccess(guest.email));

  return NextResponse.json({
    user: {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      tier: guest.tier,
    },
    canAccessAdmin,
  });
}

export async function createAdminSessionResponse(admin: AdminAccount) {
  await setAdminSessionCookie(admin);

  return NextResponse.json({
    admin: { id: admin.id, name: admin.name, email: admin.email },
    canAccessAdmin: true,
  });
}
