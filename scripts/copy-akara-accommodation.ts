import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const SOURCE_EMAIL = "akara-gooden@guests.jarodandjamiewedding.com";
const TARGET_EMAIL = "akarag28@gmail.com";

const accommodationSelect = {
  tier: true,
  accommodationType: true,
  accommodationName: true,
  accommodationAddress: true,
  checkInDate: true,
  checkOutDate: true,
  needsShuttle: true,
  accommodationNotes: true,
  bedPreference: true,
  accommodationSubmittedAt: true,
  assignedRoomName: true,
  assignedRoomDetails: true,
  assignedRoomCheckIn: true,
  assignedRoomCheckOut: true,
  assignedRoomConfiguration: true,
  roomAllocationImportedAt: true,
} as const;

async function main() {
  const source = await prisma.guest.findUnique({
    where: { email: SOURCE_EMAIL },
    select: { id: true, name: true, email: true, ...accommodationSelect },
  });

  if (!source) {
    console.error(`Source guest not found: ${SOURCE_EMAIL}`);
    process.exit(1);
  }

  const target = await prisma.guest.findUnique({
    where: { email: TARGET_EMAIL },
    select: {
      id: true,
      name: true,
      email: true,
      ...accommodationSelect,
      linkedLogins: { select: { email: true, provider: true } },
    },
  });

  if (!target) {
    console.error(`Target guest not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  console.log("Source (Akara Gooden):", source.name);
  console.log("Target (Google profile):", target.name, target.email);

  const {
    id: _sourceId,
    name: _sourceName,
    email: _sourceEmail,
    ...accommodationData
  } = source;

  const updated = await prisma.guest.update({
    where: { id: target.id },
    data: accommodationData,
    select: {
      name: true,
      email: true,
      tier: true,
      accommodationType: true,
      accommodationName: true,
      accommodationSubmittedAt: true,
      assignedRoomName: true,
      assignedRoomCheckIn: true,
      assignedRoomCheckOut: true,
      assignedRoomConfiguration: true,
      linkedLogins: { select: { email: true, provider: true } },
    },
  });

  console.log("\nUpdated target guest:");
  console.log(JSON.stringify(updated, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
