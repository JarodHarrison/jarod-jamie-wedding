import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const guests = await prisma.guest.findMany({
    where: {
      OR: [
        { name: { contains: "Akara", mode: "insensitive" } },
        { name: { contains: "Goodens", mode: "insensitive" } },
        { email: { contains: "akara", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
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
      linkedLogins: { select: { email: true, provider: true } },
      sayiPartyName: true,
    },
  });
  console.log(JSON.stringify(guests, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
