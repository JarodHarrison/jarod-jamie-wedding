import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const guests = await prisma.guest.findMany({
    where: {
      OR: [
        { name: { contains: "Jarod", mode: "insensitive" } },
        { name: { contains: "J-rod", mode: "insensitive" } },
        { email: { contains: "jarod", mode: "insensitive" } },
      ],
    },
    select: {
      name: true,
      email: true,
      tier: true,
      assignedRoomName: true,
      accommodationType: true,
      accommodationSubmittedAt: true,
    },
  });
  console.log(JSON.stringify(guests, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
