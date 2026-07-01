import { prisma } from "@/lib/prisma";

export type SeatingTableKey = "LEFT" | "CENTRE" | "RIGHT" | "BRIDAL";

export type SeatingTableConfig = {
  key: SeatingTableKey;
  label: string;
  maxGuests: number;
  sortOrder: number;
  isBridal: boolean;
};

export const DEFAULT_SEATING_TABLES: SeatingTableConfig[] = [
  { key: "LEFT", label: "Left Table", maxGuests: 20, sortOrder: 0, isBridal: false },
  { key: "CENTRE", label: "Centre Table", maxGuests: 20, sortOrder: 1, isBridal: false },
  { key: "RIGHT", label: "Right Table", maxGuests: 20, sortOrder: 2, isBridal: false },
  {
    key: "BRIDAL",
    label: "Our Table",
    maxGuests: 6,
    sortOrder: 3,
    isBridal: true,
  },
];

export const SEATING_TABLE_KEYS = DEFAULT_SEATING_TABLES.map((table) => table.key);

export function isSeatingTableKey(value: string): value is SeatingTableKey {
  return SEATING_TABLE_KEYS.includes(value as SeatingTableKey);
}

export function seatingGuestLabel(name: string, plusOneName: string | null): string {
  if (!plusOneName?.trim()) return name;
  return `${name} & ${plusOneName.trim()}`;
}

export async function ensureSeatingTables() {
  const existing = await prisma.seatingTable.count();
  if (existing > 0) return;

  await prisma.seatingTable.createMany({
    data: DEFAULT_SEATING_TABLES,
    skipDuplicates: true,
  });
}

export type SeatingGuestRow = {
  id: string;
  name: string;
  displayName: string;
  plusOneName: string | null;
  rsvpStatus: string;
  seatingTableKey: SeatingTableKey | null;
  seatingSortOrder: number | null;
};

export type SeatingChartPayload = {
  tables: Array<
    SeatingTableConfig & {
      guests: Array<{ id: string; name: string; displayName: string; isYou?: boolean }>;
    }
  >;
  unassigned: Array<{ id: string; name: string; displayName: string }>;
  yourTableKey: SeatingTableKey | null;
  yourTableLabel: string | null;
};

export async function assignGuestToSeatingTable(
  guestId: string,
  tableKey: SeatingTableKey | null,
  sortOrder?: number,
): Promise<{ error?: string }> {
  await ensureSeatingTables();

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { id: true, rsvpStatus: true },
  });
  if (!guest) return { error: "Guest not found." };
  if (guest.rsvpStatus !== "ACCEPTED") {
    return { error: "Only accepted guests can be seated." };
  }

  if (!tableKey) {
    await prisma.guest.update({
      where: { id: guestId },
      data: { seatingTableKey: null, seatingSortOrder: null },
    });
    return {};
  }

  const table = await prisma.seatingTable.findUnique({ where: { key: tableKey } });
  if (!table) return { error: "Table not found." };

  const seatedCount = await prisma.guest.count({
    where: { seatingTableKey: tableKey, NOT: { id: guestId } },
  });
  if (seatedCount >= table.maxGuests) {
    return { error: `${table.label} is full (max ${table.maxGuests}).` };
  }

  const nextSortOrder =
    sortOrder ??
    ((await prisma.guest.aggregate({
      where: { seatingTableKey: tableKey },
      _max: { seatingSortOrder: true },
    }))._max.seatingSortOrder ?? -1) + 1;

  await prisma.guest.update({
    where: { id: guestId },
    data: {
      seatingTableKey: tableKey,
      seatingSortOrder: nextSortOrder,
    },
  });

  return {};
}

export async function loadSeatingChart(viewerGuestId?: string): Promise<SeatingChartPayload> {
  await ensureSeatingTables();

  const [tables, guests] = await Promise.all([
    prisma.seatingTable.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.guest.findMany({
      where: { rsvpStatus: "ACCEPTED" },
      orderBy: [{ seatingTableKey: "asc" }, { seatingSortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        plusOneName: true,
        rsvpStatus: true,
        seatingTableKey: true,
        seatingSortOrder: true,
      },
    }),
  ]);

  const unassigned = guests
    .filter((guest) => !guest.seatingTableKey)
    .map((guest) => ({
      id: guest.id,
      name: guest.name,
      displayName: seatingGuestLabel(guest.name, guest.plusOneName),
    }));

  const viewer = viewerGuestId ? guests.find((guest) => guest.id === viewerGuestId) : null;

  return {
    tables: tables.map((table) => ({
      key: table.key,
      label: table.label,
      maxGuests: table.maxGuests,
      sortOrder: table.sortOrder,
      isBridal: table.isBridal,
      guests: guests
        .filter((guest) => guest.seatingTableKey === table.key)
        .map((guest) => ({
          id: guest.id,
          name: guest.name,
          displayName: seatingGuestLabel(guest.name, guest.plusOneName),
          isYou: guest.id === viewerGuestId,
        })),
    })),
    unassigned,
    yourTableKey: viewer?.seatingTableKey ?? null,
    yourTableLabel:
      viewer?.seatingTableKey != null
        ? (tables.find((table) => table.key === viewer.seatingTableKey)?.label ?? null)
        : null,
  };
}
