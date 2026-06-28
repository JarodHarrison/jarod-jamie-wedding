import { normalizeEmail } from "@/lib/api-utils";
import {
  createAdminSessionResponse,
  createGuestSessionResponse,
  redirectWithAdminSession,
  redirectWithGuestSession,
} from "@/lib/auth/create-session";
import { isAdminPreferredEmail, isGuestOnlyEmail } from "@/lib/auth/account-roles";
import { hashPassword } from "@/lib/auth/password";
import { findClaimableGuestForSignup, findGuestByLoginEmail } from "@/lib/guest-claim";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

const guestSelect = {
  id: true,
  name: true,
  email: true,
  tier: true,
  isMc: true,
} as const;

const adminSelect = {
  id: true,
  name: true,
  email: true,
} as const;

async function resolveGuestSession(email: string) {
  return findGuestByLoginEmail(email);
}

export async function signInWithEmailAccount(email: string) {
  const normalized = normalizeEmail(email);
  const [guest, admin] = await Promise.all([
    resolveGuestSession(normalized),
    prisma.admin.findUnique({ where: { email: normalized }, select: adminSelect }),
  ]);

  if (isGuestOnlyEmail(normalized)) {
    if (!guest) return null;
    return createGuestSessionResponse(guest);
  }

  if (isAdminPreferredEmail(normalized) && admin) {
    return createAdminSessionResponse(admin);
  }

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
    resolveGuestSession(normalized),
    prisma.admin.findUnique({ where: { email: normalized }, select: adminSelect }),
  ]);

  if (isGuestOnlyEmail(normalized)) {
    if (!guest) return null;
    return redirectWithGuestSession(guest, redirectUrl);
  }

  if (isAdminPreferredEmail(normalized) && admin) {
    return redirectWithAdminSession(admin, redirectUrl);
  }

  if (guest) {
    return redirectWithGuestSession(guest, redirectUrl);
  }

  if (admin) {
    return redirectWithAdminSession(admin, redirectUrl);
  }

  return null;
}

async function createOrClaimGoogleGuest(email: string, name: string) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.guest.findUnique({
    where: { email: normalized },
    select: { id: true, passwordPlaintext: true },
  });

  if (existing?.passwordPlaintext) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const randomPassword = crypto.randomBytes(32).toString("base64url");
  const passwordHash = await hashPassword(randomPassword);
  const displayName = name.trim() || normalized.split("@")[0] || "Guest";
  const claimable =
    existing && !existing.passwordPlaintext
      ? { id: existing.id }
      : await findClaimableGuestForSignup(displayName, normalized);

  const guest = claimable
    ? await prisma.guest.update({
        where: { id: claimable.id },
        data: {
          name: displayName,
          email: normalized,
          passwordHash,
          passwordPlaintext: null,
        },
        select: guestSelect,
      })
    : await prisma.guest.create({
        data: {
          name: displayName,
          email: normalized,
          passwordHash,
          tier: "OFF_SITE",
        },
        select: guestSelect,
      });

  await recordGoogleLoginForGuest(guest.id, normalized);

  return guest;
}

export async function signUpWithGoogleAccount(email: string, name: string) {
  const guest = await createOrClaimGoogleGuest(email, name);
  return createGuestSessionResponse(guest);
}

export async function signUpWithGoogleAccountRedirect(email: string, name: string, redirectUrl: URL) {
  const guest = await createOrClaimGoogleGuest(email, name);
  return redirectWithGuestSession(guest, redirectUrl);
}

export async function linkGoogleAccountToGuest(guestId: string, googleEmail: string) {
  const normalized = normalizeEmail(googleEmail);
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { id: true, email: true },
  });

  if (!guest) {
    throw new Error("Guest not found.");
  }

  if (guest.email === normalized) {
    throw new Error("This Google email is already your primary login email.");
  }

  const existingGuest = await prisma.guest.findUnique({
    where: { email: normalized },
    select: { id: true, passwordPlaintext: true },
  });

  if (existingGuest && existingGuest.id !== guestId) {
    if (existingGuest.passwordPlaintext) {
      throw new Error("That Google email belongs to another guest account.");
    }

    throw new Error(
      "That Google email matches an unclaimed invite. Sign in with Google once to activate it, or ask Jarod & Jamie to merge the accounts.",
    );
  }

  const existingLink = await prisma.guestLinkedLogin.findUnique({
    where: { email: normalized },
    select: { guestId: true },
  });

  if (existingLink && existingLink.guestId !== guestId) {
    throw new Error("That Google email is linked to another guest account.");
  }

  if (existingLink?.guestId === guestId) {
    return { email: normalized, alreadyLinked: true };
  }

  await prisma.guestLinkedLogin.create({
    data: {
      guestId,
      provider: "google",
      email: normalized,
    },
  });

  return { email: normalized, alreadyLinked: false };
}

export async function recordGoogleLoginForGuest(guestId: string, googleEmail: string) {
  const normalized = normalizeEmail(googleEmail);
  await prisma.guestLinkedLogin.upsert({
    where: { email: normalized },
    create: { guestId, provider: "google", email: normalized },
    update: { guestId },
  });
}

export async function unlinkGoogleAccountFromGuest(guestId: string, linkedEmail: string) {
  const normalized = normalizeEmail(linkedEmail);
  const link = await prisma.guestLinkedLogin.findUnique({
    where: { email: normalized },
    select: { guestId: true },
  });

  if (!link || link.guestId !== guestId) {
    throw new Error("Linked Google account not found.");
  }

  await prisma.guestLinkedLogin.delete({ where: { email: normalized } });
}

export async function listLinkedGoogleAccounts(guestId: string) {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      email: true,
      linkedLogins: {
        where: { provider: "google" },
        orderBy: { createdAt: "asc" },
        select: { email: true, createdAt: true },
      },
    },
  });

  if (!guest) return { primaryEmail: null, linkedEmails: [] as string[] };

  return {
    primaryEmail: guest.email,
    linkedEmails: guest.linkedLogins.map((login) => login.email),
  };
}
