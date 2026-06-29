import type { TransferMatchKind, TransferMatchStatus } from "@/generated/prisma/client";
import { createInAppNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { sendTransferIntroductionEmail } from "@/lib/transfer-intro-email";
import { arrivalMaxWaitLabel, arrivalWaitWindowsOverlap } from "@/lib/transfer-arrival-wait";
import { airportLabel, formatTravelWhen } from "@/lib/transfer-match-labels";

export { airportLabel, formatTravelWhen };

export type TransferGuestCandidate = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  plusOneGuestId: string | null;
  rsvpStatus: string;
  wantsSharedTransfer: boolean | null;
  shareTransferContactDetails: boolean | null;
  arrivalAirport: string | null;
  arrivalDate: string | null;
  arrivalTime: string | null;
  arrivalMaxWait: string | null;
  departureAirport: string | null;
  departureDate: string | null;
  departureTime: string | null;
};

const transferGuestSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  plusOneGuestId: true,
  rsvpStatus: true,
  wantsSharedTransfer: true,
  shareTransferContactDetails: true,
  arrivalAirport: true,
  arrivalDate: true,
  arrivalTime: true,
  arrivalMaxWait: true,
  departureAirport: true,
  departureDate: true,
  departureTime: true,
} as const;

function orderedGuestIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function isPlusOnePair(a: TransferGuestCandidate, b: TransferGuestCandidate): boolean {
  return a.plusOneGuestId === b.id || b.plusOneGuestId === a.id;
}

function isEligibleForMatching(guest: TransferGuestCandidate): boolean {
  return (
    guest.rsvpStatus === "ACCEPTED" &&
    guest.wantsSharedTransfer === true &&
    guest.shareTransferContactDetails === true
  );
}

function arrivalMatches(a: TransferGuestCandidate, b: TransferGuestCandidate): boolean {
  if (!a.arrivalAirport || !a.arrivalDate || !a.arrivalMaxWait) return false;
  if (!b.arrivalAirport || !b.arrivalDate || !b.arrivalMaxWait) return false;
  if (a.arrivalAirport !== b.arrivalAirport || a.arrivalDate !== b.arrivalDate) return false;
  if (!a.arrivalTime || !b.arrivalTime) return false;
  return arrivalWaitWindowsOverlap(a, b);
}

function departureMatches(a: TransferGuestCandidate, b: TransferGuestCandidate): boolean {
  if (!a.departureAirport || !a.departureDate || !b.departureAirport || !b.departureDate) {
    return false;
  }
  return a.departureAirport === b.departureAirport && a.departureDate === b.departureDate;
}

function kindsForPair(a: TransferGuestCandidate, b: TransferGuestCandidate): TransferMatchKind[] {
  const kinds: TransferMatchKind[] = [];
  if (arrivalMatches(a, b)) kinds.push("ARRIVAL");
  if (departureMatches(a, b)) kinds.push("DEPARTURE");
  return kinds;
}

function matchNotificationBody(
  otherName: string,
  kind: TransferMatchKind,
  other: TransferGuestCandidate,
): string {
  if (kind === "ARRIVAL") {
    const waitLabel = arrivalMaxWaitLabel(other.arrivalMaxWait);
    const waitNote = waitLabel ? ` (happy to wait up to ${waitLabel})` : "";
    return `${otherName} is arriving at ${airportLabel(other.arrivalAirport)} on ${formatTravelWhen(other.arrivalDate, other.arrivalTime)}${waitNote} — your schedules overlap. Open Profile → Flights & shared transfers to connect if you'd like.`;
  }
  return `${otherName} is departing from ${airportLabel(other.departureAirport)} on ${formatTravelWhen(other.departureDate, other.departureTime)} — close to your plans. Open Profile → Flights & shared transfers to connect if you'd like.`;
}

async function notifyNewMatch(
  guestId: string,
  other: TransferGuestCandidate,
  kind: TransferMatchKind,
): Promise<void> {
  await createInAppNotifications(
    [guestId],
    "We found a travel buddy ✈️",
    matchNotificationBody(other.name, kind, other),
  );
}

async function introduceMatch(matchId: string): Promise<void> {
  const match = await prisma.transferMatch.findUnique({
    where: { id: matchId },
    include: {
      guestLow: { select: transferGuestSelect },
      guestHigh: { select: transferGuestSelect },
    },
  });

  if (!match || match.status !== "PENDING") return;
  if (match.guestLowConsent !== true || match.guestHighConsent !== true) return;

  const [guestA, guestB] =
    match.guestLowId < match.guestHighId
      ? [match.guestLow, match.guestHigh]
      : [match.guestHigh, match.guestLow];

  const emailedA = await sendTransferIntroductionEmail({
    recipient: guestA,
    buddy: guestB,
    kind: match.kind,
  });
  const emailedB = await sendTransferIntroductionEmail({
    recipient: guestB,
    buddy: guestA,
    kind: match.kind,
  });

  if (!emailedA || !emailedB) {
    console.warn("[transfer-match] Introduction email failed for match", matchId);
    return;
  }

  await prisma.transferMatch.update({
    where: { id: matchId },
    data: {
      status: "INTRODUCED",
      introducedAt: new Date(),
    },
  });
}

export async function syncTransferMatchesForGuest(guestId: string): Promise<void> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: transferGuestSelect,
  });
  if (!guest) return;

  const candidates = await prisma.guest.findMany({
    where: {
      id: { not: guestId },
      rsvpStatus: "ACCEPTED",
      wantsSharedTransfer: true,
      shareTransferContactDetails: true,
    },
    select: transferGuestSelect,
  });

  const validKeys = new Set<string>();

  if (isEligibleForMatching(guest)) {
    for (const other of candidates) {
      if (!isEligibleForMatching(other) || isPlusOnePair(guest, other)) continue;

      for (const kind of kindsForPair(guest, other)) {
        const [guestLowId, guestHighId] = orderedGuestIds(guest.id, other.id);
        validKeys.add(`${guestLowId}:${guestHighId}:${kind}`);

        const existing = await prisma.transferMatch.findUnique({
          where: {
            guestLowId_guestHighId_kind: { guestLowId, guestHighId, kind },
          },
        });

        if (existing) {
          if (existing.status === "DECLINED" || existing.status === "INTRODUCED") continue;
          if (!existing.notifiedAt) {
            await prisma.transferMatch.update({
              where: { id: existing.id },
              data: { notifiedAt: new Date() },
            });
            await notifyNewMatch(guest.id, other, kind);
            await notifyNewMatch(other.id, guest, kind);
          }
          continue;
        }

        const created = await prisma.transferMatch.create({
          data: {
            guestLowId,
            guestHighId,
            kind,
            notifiedAt: new Date(),
          },
        });

        await notifyNewMatch(guest.id, other, kind);
        await notifyNewMatch(other.id, guest, kind);

        if (created.guestLowConsent === true && created.guestHighConsent === true) {
          await introduceMatch(created.id);
        }
      }
    }
  }

  const existingMatches = await prisma.transferMatch.findMany({
    where: {
      status: "PENDING",
      OR: [{ guestLowId: guestId }, { guestHighId: guestId }],
    },
  });

  for (const match of existingMatches) {
    const key = `${match.guestLowId}:${match.guestHighId}:${match.kind}`;
    if (!validKeys.has(key)) {
      await prisma.transferMatch.update({
        where: { id: match.id },
        data: { status: "DECLINED" },
      });
    }
  }
}

export type SerializedTransferMatch = {
  id: string;
  kind: TransferMatchKind;
  status: TransferMatchStatus;
  myConsent: boolean | null;
  otherGuest: {
    id: string;
    name: string;
    arrivalAirport: string | null;
    arrivalDate: string | null;
    arrivalTime: string | null;
    arrivalMaxWait: string | null;
    departureAirport: string | null;
    departureDate: string | null;
    departureTime: string | null;
  };
  introducedAt: string | null;
  createdAt: string;
};

export async function listTransferMatchesForGuest(
  guestId: string,
): Promise<SerializedTransferMatch[]> {
  const matches = await prisma.transferMatch.findMany({
    where: {
      OR: [{ guestLowId: guestId }, { guestHighId: guestId }],
      status: { not: "DECLINED" },
    },
    include: {
      guestLow: {
        select: {
          id: true,
          name: true,
          arrivalAirport: true,
          arrivalDate: true,
          arrivalTime: true,
          arrivalMaxWait: true,
          departureAirport: true,
          departureDate: true,
          departureTime: true,
        },
      },
      guestHigh: {
        select: {
          id: true,
          name: true,
          arrivalAirport: true,
          arrivalDate: true,
          arrivalTime: true,
          arrivalMaxWait: true,
          departureAirport: true,
          departureDate: true,
          departureTime: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return matches.map((match) => {
    const isLow = match.guestLowId === guestId;
    const other = isLow ? match.guestHigh : match.guestLow;
    return {
      id: match.id,
      kind: match.kind,
      status: match.status,
      myConsent: isLow ? match.guestLowConsent : match.guestHighConsent,
      otherGuest: other,
      introducedAt: match.introducedAt?.toISOString() ?? null,
      createdAt: match.createdAt.toISOString(),
    };
  });
}

export async function respondToTransferMatch(
  guestId: string,
  matchId: string,
  accept: boolean,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const match = await prisma.transferMatch.findUnique({ where: { id: matchId } });
  if (!match) return { ok: false, error: "Match not found.", status: 404 };
  if (match.status !== "PENDING") {
    return { ok: false, error: "This match is no longer open.", status: 400 };
  }

  const isLow = match.guestLowId === guestId;
  const isHigh = match.guestHighId === guestId;
  if (!isLow && !isHigh) return { ok: false, error: "Not your match.", status: 403 };

  if (!accept) {
    await prisma.transferMatch.update({
      where: { id: matchId },
      data: {
        status: "DECLINED",
        ...(isLow ? { guestLowConsent: false } : { guestHighConsent: false }),
      },
    });
    return { ok: true };
  }

  const updated = await prisma.transferMatch.update({
    where: { id: matchId },
    data: isLow ? { guestLowConsent: true } : { guestHighConsent: true },
  });

  if (updated.guestLowConsent === true && updated.guestHighConsent === true) {
    await introduceMatch(matchId);
  }

  return { ok: true };
}

export type AdminTransferMatch = {
  id: string;
  kind: TransferMatchKind;
  status: TransferMatchStatus;
  guestA: { id: string; name: string };
  guestB: { id: string; name: string };
  guestLowConsent: boolean | null;
  guestHighConsent: boolean | null;
  introducedAt: string | null;
  createdAt: string;
};

export async function listAdminTransferMatches(): Promise<AdminTransferMatch[]> {
  const matches = await prisma.transferMatch.findMany({
    where: { status: { not: "DECLINED" } },
    include: {
      guestLow: { select: { id: true, name: true } },
      guestHigh: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return matches.map((match) => ({
    id: match.id,
    kind: match.kind,
    status: match.status,
    guestA: match.guestLow,
    guestB: match.guestHigh,
    guestLowConsent: match.guestLowConsent,
    guestHighConsent: match.guestHighConsent,
    introducedAt: match.introducedAt?.toISOString() ?? null,
    createdAt: match.createdAt.toISOString(),
  }));
}
