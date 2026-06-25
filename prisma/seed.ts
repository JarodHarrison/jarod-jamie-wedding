import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";
import { JAROD_GUEST_EMAIL } from "../src/lib/auth/account-roles";

import { SHUTTLE_STOPS } from "../src/lib/shuttle/stops";

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
    where: { email: JAROD_GUEST_EMAIL },
    update: { passwordHash: guestPasswordHash, passwordPlaintext: demoGuestPassword },
    create: {
      name: "Jarod Harrison",
      email: JAROD_GUEST_EMAIL,
      tier: "PENTHOUSE",
      rsvpStatus: "ACCEPTED",
      passwordHash: guestPasswordHash,
      passwordPlaintext: demoGuestPassword,
    },
  });

  await prisma.guest.upsert({
    where: { email: "demo.penthouse@example.com" },
      update: { passwordHash: guestPasswordHash, passwordPlaintext: demoGuestPassword },
      create: {
        name: "Demo Penthouse Guest",
        email: "demo.penthouse@example.com",
        tier: "PENTHOUSE",
        passwordHash: guestPasswordHash,
        passwordPlaintext: demoGuestPassword,
      },
  });

  await prisma.guest.upsert({
    where: { email: "demo.onsite@example.com" },
      update: { passwordHash: guestPasswordHash, passwordPlaintext: demoGuestPassword },
      create: {
        name: "Demo On-site Guest",
        email: "demo.onsite@example.com",
        tier: "ON_SITE",
        passwordHash: guestPasswordHash,
        passwordPlaintext: demoGuestPassword,
      },
  });

  await prisma.guest.upsert({
    where: { email: "demo.offsite@example.com" },
      update: { passwordHash: guestPasswordHash, passwordPlaintext: demoGuestPassword },
      create: {
        name: "Demo Off-site Guest",
        email: "demo.offsite@example.com",
        tier: "OFF_SITE",
        passwordHash: guestPasswordHash,
        passwordPlaintext: demoGuestPassword,
      },
  });

  const shuttleRoute = await prisma.shuttleRoute.upsert({
    where: { id: "wedding-shuttle-route" },
    update: { name: "Wedding Day Courtesy Shuttle", active: true },
    create: {
      id: "wedding-shuttle-route",
      name: "Wedding Day Courtesy Shuttle",
      active: true,
    },
  });

  for (const stop of SHUTTLE_STOPS) {
    await prisma.shuttleStop.upsert({
      where: {
        routeId_slug: { routeId: shuttleRoute.id, slug: stop.slug },
      },
      update: {
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopOrder: stop.stopOrder,
      },
      create: {
        routeId: shuttleRoute.id,
        slug: stop.slug,
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopOrder: stop.stopOrder,
      },
    });
  }

  const driverPin = process.env.SHUTTLE_DRIVER_PIN ?? "260926";
  await prisma.driver.upsert({
    where: { id: "wedding-shuttle-driver" },
    update: {
      name: "Wedding Shuttle Driver",
      pinHash: await hashPassword(driverPin),
    },
    create: {
      id: "wedding-shuttle-driver",
      name: "Wedding Shuttle Driver",
      phone: null,
      pinHash: await hashPassword(driverPin),
    },
  });

  console.log("Seed complete.");
  console.log("Shuttle driver PIN:", driverPin, "(override with SHUTTLE_DRIVER_PIN)");
  console.log("Driver portal: /driver");
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
