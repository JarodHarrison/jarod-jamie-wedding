import "dotenv/config";
import { seedBucksPartyOrganisers } from "../src/lib/bucks-party-server";
import { prisma } from "../src/lib/prisma";

async function main() {
  const count = await seedBucksPartyOrganisers();
  const organisers = await prisma.guest.findMany({
    where: { isBucksPartyAdmin: true },
    select: { name: true, email: true },
    orderBy: { name: "asc" },
  });
  console.log(`Updated ${count} guest row(s).`);
  console.log("Bucks organisers:");
  console.log(JSON.stringify(organisers, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
