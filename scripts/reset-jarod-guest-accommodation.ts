import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { JAROD_GUEST_EMAIL } from "../src/lib/auth/account-roles";

const JAROD_ROOM = {
  assignedRoomName: "Provincial Suite 10",
  assignedRoomDetails: "End Homestead\nUpstairs\nShower & Spa\nLounge Area",
  assignedRoomCheckIn: "25/09/26",
  assignedRoomCheckOut: "27/09/26",
  assignedRoomConfiguration: "King",
  roomAllocationImportedAt: new Date(),
} as const;

async function main() {
  const guest = await prisma.guest.findUnique({
    where: { email: JAROD_GUEST_EMAIL },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      accommodationType: true,
      accommodationName: true,
      accommodationSubmittedAt: true,
      assignedRoomName: true,
      assignedRoomConfiguration: true,
      bedPreference: true,
      linkedLogins: { select: { id: true, provider: true, email: true } },
    },
  });

  if (!guest) {
    console.error(`Guest not found: ${JAROD_GUEST_EMAIL}`);
    process.exit(1);
  }

  console.log("Before:", JSON.stringify(guest, null, 2));

  const linkedRemoved = await prisma.guestLinkedLogin.deleteMany({
    where: { guestId: guest.id },
  });

  const tier =
    guest.tier === "PENTHOUSE" ? ("PENTHOUSE" as const) : ("ON_SITE" as const);

  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: {
      accommodationType: null,
      accommodationName: null,
      accommodationAddress: null,
      checkInDate: null,
      checkOutDate: null,
      needsShuttle: null,
      accommodationNotes: null,
      bedPreference: null,
      accommodationSubmittedAt: null,
      ...JAROD_ROOM,
      tier,
    },
    select: {
      email: true,
      tier: true,
      accommodationType: true,
      accommodationSubmittedAt: true,
      assignedRoomName: true,
      assignedRoomCheckIn: true,
      assignedRoomCheckOut: true,
      assignedRoomConfiguration: true,
      bedPreference: true,
    },
  });

  console.log("\nAfter reset (room allocation preserved):");
  console.log(JSON.stringify(updated, null, 2));
  console.log(`\nRemoved ${linkedRemoved.count} linked login(s).`);
  console.log("Room allocation set to Provincial Suite 10 (from room spreadsheet).");
  console.log(
    "Jarod can sign in at jarod.harrison87@gmail.com — accommodation form should auto-populate from room allocation.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
