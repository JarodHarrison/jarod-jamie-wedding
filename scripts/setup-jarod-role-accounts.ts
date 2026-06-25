import "dotenv/config";
import crypto from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";
import {
  JAROD_ADMIN_EMAIL,
  JAROD_GUEST_EMAIL,
} from "../src/lib/auth/account-roles";

const LEGACY_GUEST_EMAIL = JAROD_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.JAROD_ADMIN_PASSWORD ?? "Smile4me";

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

  const gmailGuest = await prisma.guest.findUnique({
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
