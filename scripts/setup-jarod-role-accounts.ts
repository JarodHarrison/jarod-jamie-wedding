import "dotenv/config";
import crypto from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";
import {
  JAMIE_ADMIN_EMAIL,
  JAROD_ADMIN_EMAIL,
  JAROD_GUEST_EMAIL,
} from "../src/lib/auth/account-roles";
import { buildRsvpHydrationUpdate, groomDefaultRsvpPatch } from "../src/lib/rsvp-form-defaults";

const LEGACY_GUEST_EMAIL = JAROD_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.JAROD_ADMIN_PASSWORD ?? "Smile4me";

async function findJamieGuestProfile() {
  const byAdminEmail = await prisma.guest.findUnique({
    where: { email: JAMIE_ADMIN_EMAIL },
    select: { id: true, name: true, email: true },
  });
  if (byAdminEmail) return byAdminEmail;

  const candidates = await prisma.guest.findMany({
    where: {
      OR: [
        { name: { contains: "Jamie", mode: "insensitive" } },
        { name: { contains: "Jamo", mode: "insensitive" } },
        { email: { contains: "jamie", mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
  });

  return (
    candidates.find((guest) => guest.name.toLowerCase().includes("stocks")) ??
    candidates.find((guest) => guest.name.toLowerCase().includes("jamie")) ??
    candidates[0] ??
    null
  );
}

async function hydrateGuestRsvp(guestId: string) {
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) return;

  const groomPatch = groomDefaultRsvpPatch(guest.name);
  const groomUpdates =
    guest.rsvpStatus === "PENDING" && Object.keys(groomPatch).length > 0 ? groomPatch : {};

  const sayiCustomData =
    guest.sayiCustomData && typeof guest.sayiCustomData === "object" && !Array.isArray(guest.sayiCustomData)
      ? (guest.sayiCustomData as Record<string, string>)
      : null;

  const hydration = buildRsvpHydrationUpdate({
    phone: guest.phone,
    plusOneName: guest.plusOneName,
    plusOneGuestId: guest.plusOneGuestId,
    dietaryNotes: guest.dietaryNotes,
    songRequest: guest.songRequest,
    sayiCustomData,
    sayiImportedAt: guest.sayiImportedAt,
  });

  const data = { ...groomUpdates, ...hydration };
  if (Object.keys(data).length === 0) return;

  await prisma.guest.update({ where: { id: guestId }, data });
  console.log(`Hydrated RSVP fields for guest ${guest.name} (${guest.email}).`);
}

async function linkAdminToGuest(adminEmail: string, guest: { id: string; name: string; email: string }) {
  await prisma.admin.update({
    where: { email: adminEmail },
    data: { linkedGuestId: guest.id },
  });
  console.log(`Linked admin ${adminEmail} to guest ${guest.name} (${guest.email}).`);
  await hydrateGuestRsvp(guest.id);
}

async function findJarodGuestProfile() {
  const byEmail = await prisma.guest.findUnique({
    where: { email: JAROD_GUEST_EMAIL },
    select: { id: true, name: true, email: true },
  });
  if (byEmail) return byEmail;

  const candidates = await prisma.guest.findMany({
    where: {
      OR: [
        { email: JAROD_GUEST_EMAIL },
        { name: { contains: "J-rod", mode: "insensitive" } },
        { name: { contains: "Jarod", mode: "insensitive" } },
        { email: { contains: "jarod.harrison87", mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
  });

  return (
    candidates.find((guest) => guest.email === JAROD_GUEST_EMAIL) ??
    candidates.find((guest) => guest.email.includes("jarod.harrison87")) ??
    candidates[0] ??
    null
  );
}

async function main() {
  const legacyGuest = await prisma.guest.findUnique({
    where: { email: LEGACY_GUEST_EMAIL },
  });

  const existingGmailGuest = await prisma.guest.findUnique({
    where: { email: JAROD_GUEST_EMAIL },
  });

  if (legacyGuest && !existingGmailGuest) {
    await prisma.guest.create({
      data: {
        name: legacyGuest.name || "Jarod Harrison",
        email: JAROD_GUEST_EMAIL,
        passwordHash: legacyGuest.passwordHash,
        passwordPlaintext: legacyGuest.passwordPlaintext,
        tier: legacyGuest.tier,
        rsvpStatus: legacyGuest.rsvpStatus,
        phone: legacyGuest.phone,
        plusOneName: legacyGuest.plusOneName,
        dietaryNotes: legacyGuest.dietaryNotes,
        songRequest: legacyGuest.songRequest,
        rsvpSubmittedAt: legacyGuest.rsvpSubmittedAt,
        accommodationType: legacyGuest.accommodationType,
        accommodationName: legacyGuest.accommodationName,
        accommodationAddress: legacyGuest.accommodationAddress,
        checkInDate: legacyGuest.checkInDate,
        checkOutDate: legacyGuest.checkOutDate,
        needsShuttle: legacyGuest.needsShuttle,
        accommodationNotes: legacyGuest.accommodationNotes,
        accommodationSubmittedAt: legacyGuest.accommodationSubmittedAt,
        wantsSharedTransfer: legacyGuest.wantsSharedTransfer,
        arrivalAirport: legacyGuest.arrivalAirport,
        arrivalDate: legacyGuest.arrivalDate,
        arrivalTime: legacyGuest.arrivalTime,
        departureAirport: legacyGuest.departureAirport,
        departureDate: legacyGuest.departureDate,
        departureTime: legacyGuest.departureTime,
        flightNumber: legacyGuest.flightNumber,
        passengerCount: legacyGuest.passengerCount,
        transferNotes: legacyGuest.transferNotes,
        transferSubmittedAt: legacyGuest.transferSubmittedAt,
        glowUpInterest: legacyGuest.glowUpInterest,
        onSiteServiceInterest: legacyGuest.onSiteServiceInterest,
        interestsSubmittedAt: legacyGuest.interestsSubmittedAt,
        profilePhotoMime: legacyGuest.profilePhotoMime,
        profilePhotoData: legacyGuest.profilePhotoData,
        guestOfHost: legacyGuest.guestOfHost,
        guestRelationship: legacyGuest.guestRelationship,
        guestRelationshipNote: legacyGuest.guestRelationshipNote,
        profileUpdatedAt: legacyGuest.profileUpdatedAt,
        sayiPartyName: legacyGuest.sayiPartyName,
        sayiLink: legacyGuest.sayiLink,
        sayiPlusOneAllowed: legacyGuest.sayiPlusOneAllowed,
        mailingAddress: legacyGuest.mailingAddress,
        sayiImportedAt: legacyGuest.sayiImportedAt,
        sayiCustomData: legacyGuest.sayiCustomData ?? undefined,
      },
    });

    console.log(`Created guest profile at ${JAROD_GUEST_EMAIL} (copied from ${LEGACY_GUEST_EMAIL}).`);
  } else if (existingGmailGuest) {
    console.log(`Guest ${JAROD_GUEST_EMAIL} already exists — skipping profile copy.`);
  } else {
    const passwordHash = await hashPassword(crypto.randomUUID());
    await prisma.guest.create({
      data: {
        name: "Jarod Harrison",
        email: JAROD_GUEST_EMAIL,
        passwordHash,
        passwordPlaintext: null,
        tier: "PENTHOUSE",
        rsvpStatus: "ACCEPTED",
      },
    });
    console.log(`Created new guest profile at ${JAROD_GUEST_EMAIL}.`);
  }

  if (legacyGuest) {
    await prisma.guest.delete({ where: { email: LEGACY_GUEST_EMAIL } });
    console.log(`Removed guest record for ${LEGACY_GUEST_EMAIL} (admin-only now).`);
  }

  const removedAdmins = await prisma.admin.deleteMany({
    where: { email: JAROD_GUEST_EMAIL },
  });
  if (removedAdmins.count > 0) {
    console.log(`Removed admin access from ${JAROD_GUEST_EMAIL}.`);
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await prisma.admin.upsert({
    where: { email: JAROD_ADMIN_EMAIL },
    update: { name: "Jarod", passwordHash },
    create: { name: "Jarod", email: JAROD_ADMIN_EMAIL, passwordHash },
  });
  console.log(`Ensured admin account at ${JAROD_ADMIN_EMAIL}.`);

  const jarodGuestProfile = await findJarodGuestProfile();
  if (jarodGuestProfile) {
    await linkAdminToGuest(JAROD_ADMIN_EMAIL, jarodGuestProfile);
  } else {
    console.warn(`No guest profile found to link — create ${JAROD_GUEST_EMAIL} first.`);
  }

  const jamieGuestProfile = await findJamieGuestProfile();
  if (jamieGuestProfile) {
    await linkAdminToGuest(JAMIE_ADMIN_EMAIL, jamieGuestProfile);
  } else {
    console.warn("No Jamie guest profile found — import or create Jamie Stocks guest first.");
  }

  const gmailGuest = jarodGuestProfile
    ? await prisma.guest.findUnique({
        where: { id: jarodGuestProfile.id },
        select: { email: true, tier: true, rsvpStatus: true, name: true },
      })
    : await prisma.guest.findUnique({
    where: { email: JAROD_GUEST_EMAIL },
    select: { email: true, tier: true, rsvpStatus: true, name: true },
  });
  const outlookAdmin = await prisma.admin.findUnique({
    where: { email: JAROD_ADMIN_EMAIL },
    select: { email: true, name: true },
  });

  console.log("\nSummary:");
  console.log("  Guest (guest view):", gmailGuest);
  console.log("  Admin (full access):", outlookAdmin);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
