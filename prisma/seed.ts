import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

const ADMINS = [
  {
    name: "Jarod",
    email: "jarod.harrison@outlook.com",
    password: "Smile4me",
  },
  {
    name: "Jamie",
    email: "jamie_chef35@gmail.com",
    password: "pass1667",
  },
] as const;

async function main() {
  const demoGuestPassword = process.env.SEED_GUEST_PASSWORD ?? "GuestDemo2026!";
  const guestPasswordHash = await hashPassword(demoGuestPassword);

  for (const admin of ADMINS) {
    const passwordHash = await hashPassword(admin.password);
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: { name: admin.name, passwordHash },
      create: { name: admin.name, email: admin.email, passwordHash },
    });
  }

  await prisma.admin.deleteMany({
    where: {
      email: { in: ["jarod@jarodandjamie.wedding", "jamie@jarodandjamie.wedding"] },
    },
  });

  await prisma.guest.upsert({
    where: { email: "demo.penthouse@example.com" },
    update: {},
    create: {
      name: "Demo Penthouse Guest",
      email: "demo.penthouse@example.com",
      tier: "PENTHOUSE",
      passwordHash: guestPasswordHash,
    },
  });

  await prisma.guest.upsert({
    where: { email: "demo.onsite@example.com" },
    update: {},
    create: {
      name: "Demo On-site Guest",
      email: "demo.onsite@example.com",
      tier: "ON_SITE",
      passwordHash: guestPasswordHash,
    },
  });

  await prisma.guest.upsert({
    where: { email: "demo.offsite@example.com" },
    update: {},
    create: {
      name: "Demo Off-site Guest",
      email: "demo.offsite@example.com",
      tier: "OFF_SITE",
      passwordHash: guestPasswordHash,
    },
  });

  console.log("Seed complete.");
  console.log("Admin accounts:");
  for (const admin of ADMINS) {
    console.log(`  ${admin.name}: ${admin.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
