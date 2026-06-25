import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const BEST_BITCHES = ["Kirra ten-Hove Smith", "Samantha Cooper"];

async function main() {
  for (const name of BEST_BITCHES) {
    const guest = await prisma.guest.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true, name: true, email: true, partyRole: true },
    });

    if (!guest) {
      console.warn(`No guest found for "${name}" — create their account or import them first.`);
      continue;
    }

    await prisma.guest.update({
      where: { id: guest.id },
      data: { partyRole: "BEST_BITCH" },
    });

    console.log(`Assigned BEST_BITCH role to ${guest.name} (${guest.email})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
