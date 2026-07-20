import { normalizeEmail } from "@/lib/api-utils";
import {
  glowUpInterestLabel,
  glowUpWhiteningLabel,
  type GlowUpInterestChoice,
  type GlowUpPartySource,
  type GlowUpWhiteningPackage,
} from "@/lib/glow-up-party";
import { prisma } from "@/lib/prisma";

type GlowUpRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: GlowUpInterestChoice;
  whiteningPackage: GlowUpWhiteningPackage | null;
  botoxUnits: number | null;
  fillerMl: number | null;
  notes: string | null;
  commsConsent: boolean;
  source: GlowUpPartySource;
  guestId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializedGlowUpInterest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: GlowUpInterestChoice;
  whiteningPackage: GlowUpWhiteningPackage | null;
  botoxUnits: number | null;
  fillerMl: number | null;
  notes: string | null;
  commsConsent: boolean;
  source: GlowUpPartySource;
  guestId: string | null;
  createdAt: string;
  updatedAt: string;
};

export function serializeGlowUpInterest(row: GlowUpRow): SerializedGlowUpInterest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    interest: row.interest,
    whiteningPackage: row.whiteningPackage,
    botoxUnits: row.botoxUnits,
    fillerMl: row.fillerMl,
    notes: row.notes,
    commsConsent: row.commsConsent,
    source: row.source,
    guestId: row.guestId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function glowUpInterestStats(rows: SerializedGlowUpInterest[]) {
  const teeth = rows.filter((r) => r.interest === "teeth" || r.interest === "both");
  const pump = rows.filter((r) => r.interest === "botox" || r.interest === "both");
  const withKit = teeth.filter((r) => r.whiteningPackage === "WHITENING_WITH_KIT");
  const whiteningOnly = teeth.filter((r) => r.whiteningPackage === "WHITENING_ONLY");
  const totalBotoxUnits = pump.reduce((sum, r) => sum + (r.botoxUnits ?? 0), 0);
  const totalFillerMl = pump.reduce((sum, r) => sum + (r.fillerMl ?? 0), 0);

  return {
    total: rows.length,
    teeth: teeth.length,
    pump: pump.length,
    both: rows.filter((r) => r.interest === "both").length,
    whiteningOnly: whiteningOnly.length,
    withKit: withKit.length,
    totalBotoxUnits,
    totalFillerMl: Math.round(totalFillerMl * 10) / 10,
  };
}

export async function attachGlowUpInterestsToAdminGuests<
  T extends {
    id: string;
    email: string;
    linkedLogins?: { email: string }[];
    glowUpPartyInterest?: GlowUpRow | null;
  },
>(guests: T[]): Promise<(Omit<T, "glowUpPartyInterest"> & { glowUpPartyInterest: GlowUpRow | null })[]> {
  if (guests.length === 0) {
    return guests as (Omit<T, "glowUpPartyInterest"> & { glowUpPartyInterest: GlowUpRow | null })[];
  }

  const emails = new Set<string>();
  for (const guest of guests) {
    emails.add(normalizeEmail(guest.email));
    for (const login of guest.linkedLogins ?? []) {
      emails.add(normalizeEmail(login.email));
    }
  }

  const guestIds = guests.map((g) => g.id);
  const rows = await prisma.glowUpPartyInterest.findMany({
    where: {
      OR: [{ guestId: { in: guestIds } }, { email: { in: [...emails] } }],
    },
  });

  const byGuestId = new Map<string, GlowUpRow>();
  const byEmail = new Map<string, GlowUpRow>();
  for (const row of rows) {
    const typed = row as GlowUpRow;
    if (typed.guestId) byGuestId.set(typed.guestId, typed);
    byEmail.set(normalizeEmail(typed.email), typed);
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
    return { ...guest, glowUpPartyInterest: row };
  });

  if (linkUpdates.length > 0) {
    await Promise.all(
      linkUpdates.map((update) =>
        prisma.glowUpPartyInterest
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

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function glowUpInterestsToCsv(rows: SerializedGlowUpInterest[]): string {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Interest",
    "Whitening package",
    "Botox units",
    "Filler ml",
    "Notes",
    "Source",
    "Guest linked",
    "Updated at",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        csvEscape(row.name),
        csvEscape(row.email),
        csvEscape(row.phone),
        csvEscape(glowUpInterestLabel(row.interest)),
        csvEscape(glowUpWhiteningLabel(row.whiteningPackage)),
        row.botoxUnits != null ? String(row.botoxUnits) : "",
        row.fillerMl != null ? String(row.fillerMl) : "",
        csvEscape(row.notes ?? ""),
        csvEscape(row.source),
        row.guestId ? "yes" : "no",
        csvEscape(row.updatedAt),
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}
