import { normalizeEmail } from "@/lib/api-utils";
import {
  createAdminSessionResponse,
  createGuestSessionResponse,
  redirectWithAdminSession,
  redirectWithGuestSession,
} from "@/lib/auth/create-session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

const guestSelect = {
  id: true,
  name: true,
  email: true,
  tier: true,
} as const;

const adminSelect = {
  id: true,
  name: true,
  email: true,
} as const;

export async function signInWithEmailAccount(email: string) {
  const normalized = normalizeEmail(email);
  const [guest, admin] = await Promise.all([
    prisma.guest.findUnique({ where: { email: normalized }, select: guestSelect }),
    prisma.admin.findUnique({ where: { email: normalized }, select: adminSelect }),
  ]);

  if (guest) {
    return createGuestSessionResponse(guest, Boolean(admin));
  }

  if (admin) {
    return createAdminSessionResponse(admin);
  }

  return null;
}

export async function signInWithEmailAccountRedirect(email: string, redirectUrl: URL) {
  const normalized = normalizeEmail(email);
  const [guest, admin] = await Promise.all([
    prisma.guest.findUnique({ where: { email: normalized }, select: guestSelect }),
    prisma.admin.findUnique({ where: { email: normalized }, select: adminSelect }),
  ]);

  if (guest) {
    return redirectWithGuestSession(guest, redirectUrl);
  }

  if (admin) {
    return redirectWithAdminSession(admin, redirectUrl);
  }

  return null;
}

export async function signUpWithGoogleAccount(email: string, name: string) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.guest.findUnique({ where: { email: normalized }, select: { id: true } });
  if (existing) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const randomPassword = crypto.randomBytes(32).toString("base64url");
  const passwordHash = await hashPassword(randomPassword);

  const guest = await prisma.guest.create({
    data: {
      name: name.trim() || normalized.split("@")[0] || "Guest",
      email: normalized,
      passwordHash,
      tier: "OFF_SITE",
    },
    select: guestSelect,
  });

  return createGuestSessionResponse(guest);
}

export async function signUpWithGoogleAccountRedirect(email: string, name: string, redirectUrl: URL) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.guest.findUnique({ where: { email: normalized }, select: { id: true } });
  if (existing) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const randomPassword = crypto.randomBytes(32).toString("base64url");
  const passwordHash = await hashPassword(randomPassword);

  const guest = await prisma.guest.create({
    data: {
      name: name.trim() || normalized.split("@")[0] || "Guest",
      email: normalized,
      passwordHash,
      tier: "OFF_SITE",
    },
    select: guestSelect,
  });

  return redirectWithGuestSession(guest, redirectUrl);
}
