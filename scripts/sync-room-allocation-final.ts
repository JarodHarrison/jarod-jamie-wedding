import { config } from "dotenv";
config();
config({ path: ".env.neon", override: true });

import { readFileSync } from "fs";
import { createUnclaimedPasswordFields } from "../src/lib/auth/password";
import {
  bedPreferenceFromRoomConfiguration,
  toDateInputValue,
} from "../src/lib/accommodation-form-defaults";
import { normalizeEmail } from "../src/lib/api-utils";
import {
  guestNameTokens,
  namesShareFirstName,
  normalizeGuestName,
  preferFullerGuestName,
} from "../src/lib/guest-name";
import { tierForRoomAllocation } from "../src/lib/on-site-access";
import { parseRoomAllocationSpreadsheet } from "../src/lib/room-allocation-import";

const ROOM_XLSX =
  "C:/Users/Jarod/OneDrive/Documents/Downloads/Room allocation completed.xlsx";

const DILLION_ROOM = "Deluxe Room 5";
const LIZ_EMAIL = "celebrant_flair@outlook.com";

type GuestLite = { id: string; name: string; email: string };

async function findGuest(
  prisma: Awaited<typeof import("../src/lib/prisma")>["prisma"],
  guestName: string,
  email: string | null,
  aliases: string[] = [],
): Promise<GuestLite | null> {
  if (email) {
    const byEmail = await prisma.guest.findUnique({
      where: { email: normalizeEmail(email) },
      select: { id: true, name: true, email: true },
    });
    if (byEmail) return byEmail;
  }

  const candidates = await prisma.guest.findMany({
    select: { id: true, name: true, email: true },
  });

  const searchNames = [guestName, ...aliases];
  for (const label of searchNames) {
    const normalized = normalizeGuestName(label);
    const exact = candidates.find((g) => normalizeGuestName(g.name) === normalized);
    if (exact) return exact;
  }

  for (const label of searchNames) {
    const matches = candidates.filter((g) => namesShareFirstName(g.name, label));
    if (matches.length === 1) return matches[0];

    const tokens = guestNameTokens(label);
    if (tokens.length >= 2) {
      const last = tokens.at(-1)!;
      const surnameMatches = matches.filter((g) => {
        const gt = guestNameTokens(g.name);
        return gt.length === 1 || gt.includes(last);
      });
      if (surnameMatches.length === 1) return surnameMatches[0];
    }
  }

  return null;
}

async function applyRoom(
  prisma: Awaited<typeof import("../src/lib/prisma")>["prisma"],
  guestId: string,
  row: {
    roomName: string;
    roomDetails: string | null;
    checkIn: string | null;
    checkOut: string | null;
    configuration: string | null;
    guestName?: string;
  },
  importedAt: Date,
) {
  const existing = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { tier: true, name: true },
  });
  const completedName = row.guestName
    ? preferFullerGuestName(existing?.name ?? "", row.guestName)
    : existing?.name;
  const promoted = tierForRoomAllocation(existing?.tier ?? "OFF_SITE");
  const bed = bedPreferenceFromRoomConfiguration(row.configuration);
  const checkIn = toDateInputValue(row.checkIn);
  const checkOut = toDateInputValue(row.checkOut);

  return prisma.guest.update({
    where: { id: guestId },
    data: {
      ...(completedName && completedName !== existing?.name ? { name: completedName } : {}),
      assignedRoomName: row.roomName,
      assignedRoomDetails: row.roomDetails,
      assignedRoomCheckIn: row.checkIn,
      assignedRoomCheckOut: row.checkOut,
      assignedRoomConfiguration: row.configuration,
      roomAllocationImportedAt: importedAt,
      accommodationType: "ON_SITE",
      accommodationName: `Spicers Clovelly Estate: ${row.roomName}`,
      accommodationAddress: "68 Montville-Maleny Rd, Montville QLD 4560",
      needsShuttle: false,
      ...(checkIn ? { checkInDate: checkIn } : {}),
      ...(checkOut ? { checkOutDate: checkOut } : {}),
      ...(bed ? { bedPreference: bed } : {}),
      ...(promoted ? { tier: promoted } : {}),
    },
    select: { name: true, email: true, assignedRoomName: true },
  });
}

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const buf = readFileSync(ROOM_XLSX);
  const parsed = parseRoomAllocationSpreadsheet(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );
  const importedAt = new Date();
  const summary: Record<string, unknown>[] = [];

  // Manual aliases for spreadsheet ↔ app naming differences
  const aliasesByImportName: Record<string, string[]> = {
    "Andrew Jillard": ["Andrew Gillard", "Andy Gillard"],
    "Joanna Bloodworth": ["Johanna Bloodworth", "Jo Bloodworth", "Jo"],
    "Tracy Gooden": ["Tracey Gooden"],
    "Joshua Eastman": ["Josh Eastman"],
    "Coco Afoa": ["Coco"],
    "Jarod Harrison": ["Jarod", "J-rod", "J-rod H"],
    "Jamie Stocks": ["Jamie", "Jamo"],
    "Grace Dillon": ["Grace Dillion", "Grace"],
    "Max Dillon": ["Max Dillion", "Max"],
    "Diana ten Hove - Smith": ["Diana ten Hove-Smith"],
    "Akara Gooden": ["Akara Chan", "Akara"],
  };

  for (const row of parsed.rows) {
    if (/sahara\s*\+1/i.test(row.guestName)) {
      const sahara = await findGuest(prisma, "Sahara Carroll", "saharacarroll56@gmail.com");
      if (sahara) {
        await prisma.guest.update({
          where: { id: sahara.id },
          data: { plusOneName: "Plus one" },
        });
        summary.push({ skippedPlusOne: row.guestName, attachedTo: sahara.email });
      }
      continue;
    }

    const aliases = aliasesByImportName[row.guestName] ?? [];
    const guest = await findGuest(prisma, row.guestName, row.email, aliases);
    if (!guest) {
      summary.push({ unmatched: row.guestName, email: row.email, room: row.roomName });
      continue;
    }

    // Prefer Australian spelling / preferred names from the app
    let preferredName = preferFullerGuestName(guest.name, row.guestName);
    if (/jillard|gillard/i.test(row.guestName) || /jillard|gillard/i.test(guest.name)) {
      preferredName = "Andrew Gillard";
    }
    if (/joanna|johanna|jo bloodworth/i.test(row.guestName) || /bloodworth/i.test(guest.name)) {
      preferredName = "Jo Bloodworth";
    }
    if (/tracy|tracey/i.test(row.guestName)) preferredName = "Tracey Gooden";
    if (/grace dillon/i.test(row.guestName)) preferredName = "Grace Dillion";
    if (/max dillon/i.test(row.guestName)) preferredName = "Max Dillion";
    if (/coco/i.test(row.guestName)) preferredName = "Coco Afoa";
    if (/joshua|josh eastman/i.test(row.guestName)) preferredName = "Josh Eastman";
    if (/akara/i.test(row.guestName)) preferredName = preferFullerGuestName(guest.name, "Akara Gooden");

    if (preferredName !== guest.name) {
      await prisma.guest.update({ where: { id: guest.id }, data: { name: preferredName } });
    }

    // Upgrade placeholder emails when sheet has a real unique email
    if (
      row.email &&
      guest.email.endsWith("@guests.jarodandjamiewedding.com") &&
      normalizeEmail(row.email) !== guest.email
    ) {
      const taken = await prisma.guest.findUnique({
        where: { email: normalizeEmail(row.email) },
        select: { id: true },
      });
      if (!taken) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: { email: normalizeEmail(row.email) },
        });
      }
    }

    const updated = await applyRoom(prisma, guest.id, { ...row, guestName: preferredName }, importedAt);
    summary.push({ matched: updated });
  }

  // Rosie Dillion shares Deluxe Room 5 with Grace & Max
  const grace = await findGuest(prisma, "Grace Dillion", "gracie.dillon@outlook.com.au", [
    "Grace Dillon",
    "Grace",
  ]);
  const rosie = await findGuest(prisma, "Rosie Dillion", "rosie@guests.jarodandjamiewedding.com", [
    "Rosie",
  ]);
  if (grace && rosie) {
    const room = await prisma.guest.findUnique({
      where: { id: grace.id },
      select: {
        assignedRoomName: true,
        assignedRoomDetails: true,
        assignedRoomCheckIn: true,
        assignedRoomCheckOut: true,
        assignedRoomConfiguration: true,
      },
    });
    if (room?.assignedRoomName === DILLION_ROOM) {
      const updated = await applyRoom(
        prisma,
        rosie.id,
        {
          roomName: room.assignedRoomName!,
          roomDetails: room.assignedRoomDetails,
          checkIn: room.assignedRoomCheckIn,
          checkOut: room.assignedRoomCheckOut,
          configuration: room.assignedRoomConfiguration,
          guestName: "Rosie Dillion",
        },
        importedAt,
      );
      await prisma.guest.update({
        where: { id: rosie.id },
        data: { name: "Rosie Dillion", tier: "ON_SITE" },
      });
      summary.push({ rosieRoom: updated });
    }
  }

  // Malakai Gooderson → Malakai Gooden (with Tracey/Akara in 17C)
  const malakai = await findGuest(
    prisma,
    "Malakai Gooden",
    "malakai-gooderson@guests.jarodandjamiewedding.com",
    ["Malakai Gooderson", "Malakai", "Kai"],
  );
  const tracey = await findGuest(prisma, "Tracey Gooden", "tjrosgood@hotmail.com", ["Tracy Gooden"]);
  if (malakai) {
    await prisma.guest.update({
      where: { id: malakai.id },
      data: { name: "Malakai Gooden" },
    });
    if (tracey) {
      const room = await prisma.guest.findUnique({
        where: { id: tracey.id },
        select: {
          assignedRoomName: true,
          assignedRoomDetails: true,
          assignedRoomCheckIn: true,
          assignedRoomCheckOut: true,
          assignedRoomConfiguration: true,
        },
      });
      if (room?.assignedRoomName) {
        await applyRoom(
          prisma,
          malakai.id,
          {
            roomName: room.assignedRoomName,
            roomDetails: room.assignedRoomDetails,
            checkIn: room.assignedRoomCheckIn,
            checkOut: room.assignedRoomCheckOut,
            configuration: room.assignedRoomConfiguration,
            guestName: "Malakai Gooden",
          },
          importedAt,
        );
      }
    }
    summary.push({ malakai: "Malakai Gooden" });
  }

  // Andrew Gillard: MC + preferred spelling
  const andrew = await findGuest(prisma, "Andrew Gillard", "andrewjillard67@gmail.com", [
    "Andy Gillard",
    "Andrew Jillard",
  ]);
  if (andrew) {
    await prisma.guest.update({
      where: { id: andrew.id },
      data: { name: "Andrew Gillard", isMc: true, tier: "ON_SITE" },
    });
    summary.push({ andrew: "MC + room from sheet" });
  }

  // Liz Anya: celebrant + MC
  let liz = await prisma.guest.findUnique({ where: { email: LIZ_EMAIL } });
  if (!liz) {
    const passwordFields = await createUnclaimedPasswordFields();
    liz = await prisma.guest.create({
      data: {
        name: "Liz Anya",
        email: LIZ_EMAIL,
        tier: "OFF_SITE",
        isMc: true,
        isCelebrant: true,
        passwordHash: passwordFields.passwordHash,
        passwordPlaintext: passwordFields.passwordPlaintext,
        rsvpStatus: "ACCEPTED",
      },
    });
    summary.push({ createdLiz: liz.email });
  } else {
    liz = await prisma.guest.update({
      where: { id: liz.id },
      data: { name: "Liz Anya", isMc: true, isCelebrant: true },
    });
    summary.push({ updatedLiz: liz.email });
  }

  // Jo Bloodworth finalise
  const jo = await findGuest(prisma, "Jo Bloodworth", null, [
    "Johanna Bloodworth",
    "Joanna Bloodworth",
    "Jo",
  ]);
  if (jo) {
    await prisma.guest.update({
      where: { id: jo.id },
      data: { name: "Jo Bloodworth" },
    });
    summary.push({ jo: jo.email });
  }

  console.log(JSON.stringify(summary, null, 2));

  const onSiteNoRoom = await prisma.guest.findMany({
    where: { tier: "ON_SITE", OR: [{ assignedRoomName: null }, { assignedRoomName: "" }] },
    select: { name: true, email: true, isMc: true, isCelebrant: true },
    orderBy: { name: "asc" },
  });
  const mcs = await prisma.guest.findMany({
    where: { OR: [{ isMc: true }, { isCelebrant: true }] },
    select: { name: true, email: true, isMc: true, isCelebrant: true, assignedRoomName: true },
  });
  console.log("\nOn-site without room:", JSON.stringify(onSiteNoRoom, null, 2));
  console.log("\nCelebrant/MC:", JSON.stringify(mcs, null, 2));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
