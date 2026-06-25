import { prisma } from "@/lib/prisma";

export async function applyPlusOneLink(guestId: string, plusOneGuestId: string | null) {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { id: true, name: true, plusOneGuestId: true },
  });

  if (!guest) {
    throw new Error("Guest not found.");
  }

  if (plusOneGuestId === guestId) {
    throw new Error("You cannot link yourself as your plus-one.");
  }

  if (guest.plusOneGuestId && guest.plusOneGuestId !== plusOneGuestId) {
    await prisma.guest.updateMany({
      where: { id: guest.plusOneGuestId, plusOneGuestId: guestId },
      data: { plusOneGuestId: null },
    });
  }

  if (!plusOneGuestId) {
    await prisma.guest.updateMany({
      where: { plusOneGuestId: guestId },
      data: { plusOneGuestId: null },
    });
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        plusOneGuestId: null,
        profileUpdatedAt: new Date(),
      },
    });
    return;
  }

  const partner = await prisma.guest.findUnique({
    where: { id: plusOneGuestId },
    select: { id: true, name: true, plusOneGuestId: true },
  });

  if (!partner) {
    throw new Error("Selected guest was not found.");
  }

  if (partner.plusOneGuestId && partner.plusOneGuestId !== guestId) {
    await prisma.guest.update({
      where: { id: partner.plusOneGuestId },
      data: { plusOneGuestId: null },
    });
  }

  await prisma.$transaction([
    prisma.guest.update({
      where: { id: guestId },
      data: {
        plusOneGuestId: partner.id,
        plusOneName: partner.name,
        profileUpdatedAt: new Date(),
      },
    }),
    prisma.guest.update({
      where: { id: partner.id },
      data: {
        plusOneGuestId: guestId,
        plusOneName: guest.name,
        profileUpdatedAt: new Date(),
      },
    }),
  ]);
}
