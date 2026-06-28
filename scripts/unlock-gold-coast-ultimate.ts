import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const guestName = process.argv[2] ?? "Lauren";

async function main() {
  const candidates = await prisma.guest.findMany({
    where: { name: { contains: guestName, mode: "insensitive" } },
    select: { id: true, name: true, email: true, tier: true, goldCoastTrip: { select: { id: true } } },
    orderBy: { name: "asc" },
  });

  if (candidates.length === 0) {
    console.error(`No guest found matching "${guestName}".`);
    process.exit(1);
  }

  if (candidates.length > 1) {
    console.log("Multiple matches — using the first. Pass an exact name as an argument if needed:");
    for (const guest of candidates) {
      console.log(`  - ${guest.name} (${guest.email}) [${guest.tier}]`);
    }
  }

  const guest = candidates[0]!;

  await prisma.goldCoastTrip.upsert({
    where: { guestId: guest.id },
    create: { guestId: guest.id },
    update: {},
  });

  console.log(`Unlocked Ultimate Gold Coast Experience for ${guest.name} (${guest.email}).`);
  console.log(`Tier unchanged: ${guest.tier}`);
  console.log("They will see the Gold Coast Trip tab with Ultimate Experience access after refreshing the app.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
