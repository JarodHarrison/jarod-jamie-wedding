import { GUEST_IMPORT_TEMPLATE_HEADERS } from "@/lib/guest-spreadsheet-import";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/api-utils";
import {
  BUCKS_PARTY_ORGANISER_EMAILS,
  type BucksBudgetChoice,
} from "@/lib/bucks-party";

export type BucksPartyRsvpSource = "PUBLIC" | "ADMIN_LINK";

type BucksPartyRsvpRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  attending: boolean;
  plusOneName: string | null;
  budgetChoice: number | null;
  commsConsent: boolean;
  source: BucksPartyRsvpSource;
  guestId: string | null;
  prepaidNotedAt: Date | null;
  prepaidNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializedBucksRsvp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  attending: boolean;
  plusOneName: string | null;
  budgetChoice: number | null;
  commsConsent: boolean;
  source: BucksPartyRsvpSource;
  guestId: string | null;
  prepaid: boolean;
  prepaidNotedAt: string | null;
  prepaidNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeBucksRsvp(row: BucksPartyRsvpRow): SerializedBucksRsvp {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    attending: row.attending,
    plusOneName: row.plusOneName,
    budgetChoice: row.budgetChoice,
    commsConsent: row.commsConsent,
    source: row.source,
    guestId: row.guestId,
    prepaid: Boolean(row.prepaidNotedAt),
    prepaidNotedAt: row.prepaidNotedAt?.toISOString() ?? null,
    prepaidNotes: row.prepaidNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function bucksRsvpStats(rows: SerializedBucksRsvp[]) {
  const attending = rows.filter((r) => r.attending);
  const declined = rows.filter((r) => !r.attending);
  const prepaid = attending.filter((r) => r.prepaid);
  const unpaid = attending.filter((r) => !r.prepaid);
  const budget: Record<BucksBudgetChoice, number> = { 100: 0, 130: 0, 150: 0 };
  for (const row of attending) {
    if (row.budgetChoice === 100 || row.budgetChoice === 130 || row.budgetChoice === 150) {
      budget[row.budgetChoice] += 1;
    }
  }
  return {
    total: rows.length,
    attending: attending.length,
    declined: declined.length,
    prepaid: prepaid.length,
    unpaid: unpaid.length,
    budget,
  };
}

export async function seedBucksPartyOrganisers() {
  const emails = BUCKS_PARTY_ORGANISER_EMAILS.map((e) => normalizeEmail(e));
  const result = await prisma.guest.updateMany({
    where: {
      OR: [
        { email: { in: [...emails] } },
        { linkedLogins: { some: { email: { in: [...emails] } } } },
        { name: { equals: "Aaron Apse", mode: "insensitive" } },
        { name: { equals: "Justin Neil", mode: "insensitive" } },
        { name: { equals: "Jarod Harrison", mode: "insensitive" } },
        { name: { equals: "Jamie Stocks", mode: "insensitive" } },
      ],
    },
    data: { isBucksPartyAdmin: true },
  });
  return result.count;
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Match bucks RSVPs to wedding guests by guestId or email (including Google linked logins). */
export async function attachBucksRsvpsToAdminGuests<
  T extends {
    id: string;
    email: string;
    linkedLogins?: { email: string }[];
    bucksPartyRsvp?: BucksPartyRsvpRow | null;
  },
>(guests: T[]): Promise<(Omit<T, "bucksPartyRsvp"> & { bucksPartyRsvp: BucksPartyRsvpRow | null })[]> {
  if (guests.length === 0) return guests as (Omit<T, "bucksPartyRsvp"> & { bucksPartyRsvp: BucksPartyRsvpRow | null })[];

  const emails = new Set<string>();
  for (const guest of guests) {
    emails.add(normalizeEmail(guest.email));
    for (const login of guest.linkedLogins ?? []) {
      emails.add(normalizeEmail(login.email));
    }
  }

  const guestIds = guests.map((g) => g.id);
  const rows = await prisma.bucksPartyRsvp.findMany({
    where: {
      OR: [{ guestId: { in: guestIds } }, { email: { in: [...emails] } }],
    },
  });

  const byGuestId = new Map<string, (typeof rows)[number]>();
  const byEmail = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (row.guestId) byGuestId.set(row.guestId, row);
    byEmail.set(normalizeEmail(row.email), row);
  }

  const linkUpdates: { id: string; guestId: string }[] = [];

  const result = guests.map((guest) => {
    let row = byGuestId.get(guest.id) ?? null;
    if (!row) {
      const candidates = [
        normalizeEmail(guest.email),
        ...(guest.linkedLogins ?? []).map((l) => normalizeEmail(l.email)),
      ];
      for (const email of candidates) {
        const match = byEmail.get(email);
        if (match) {
          row = match;
          if (!match.guestId) {
            linkUpdates.push({ id: match.id, guestId: guest.id });
          }
          break;
        }
      }
    }

    return {
      ...guest,
      bucksPartyRsvp: row,
    };
  });

  if (linkUpdates.length > 0) {
    await Promise.all(
      linkUpdates.map((update) =>
        prisma.bucksPartyRsvp
          .update({
            where: { id: update.id },
            data: { guestId: update.guestId },
          })
          .catch(() => null),
      ),
    );
  }

  return result;
}

export function bucksRsvpsToGuestImportCsv(rows: SerializedBucksRsvp[]): string {
  const lines = [GUEST_IMPORT_TEMPLATE_HEADERS.join(",")];
  for (const row of rows) {
    const values = [
      row.name,
      row.email,
      "OFF_SITE",
      row.attending ? "ACCEPTED" : "DECLINED",
      row.phone,
      row.plusOneName ?? "",
      "",
      "",
      "",
      "",
      `Bucks party RSVP 29 Aug 2026${row.budgetChoice ? ` · budget $${row.budgetChoice}` : ""}`,
      "",
    ];
    lines.push(values.map((v) => csvEscape(String(v))).join(","));
  }
  return `${lines.join("\n")}\n`;
}
