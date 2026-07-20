import {
  BUCKS_PARTY_CONFIG_ID,
  DEFAULT_BUCKS_PARTY_CONFIG,
  type BucksPartyConfigData,
  type BucksPartyEventUpdateInput,
} from "@/lib/bucks-party-config";
import { prisma } from "@/lib/prisma";

function serializeRow(row: {
  id: string;
  dateLabel: string;
  dateShort: string;
  timeLabel: string;
  placeLabel: string;
  placeNote: string | null;
  detailsNote: string | null;
  dressCode: string | null;
  whatToBring: string | null;
  meetingPoint: string | null;
  transportNote: string | null;
  agendaNote: string | null;
  startAt: Date;
  endAt: Date;
  calendarDescription: string | null;
  calendarLocation: string | null;
  shareBlurb: string | null;
  updatedAt: Date;
}): BucksPartyConfigData {
  return {
    id: row.id,
    dateLabel: row.dateLabel,
    dateShort: row.dateShort,
    timeLabel: row.timeLabel,
    placeLabel: row.placeLabel,
    placeNote: row.placeNote,
    detailsNote: row.detailsNote,
    dressCode: row.dressCode,
    whatToBring: row.whatToBring,
    meetingPoint: row.meetingPoint,
    transportNote: row.transportNote,
    agendaNote: row.agendaNote,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    calendarDescription: row.calendarDescription,
    calendarLocation: row.calendarLocation,
    shareBlurb: row.shareBlurb,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureBucksPartyConfig() {
  return prisma.bucksPartyConfig.upsert({
    where: { id: BUCKS_PARTY_CONFIG_ID },
    create: {
      id: BUCKS_PARTY_CONFIG_ID,
      ...DEFAULT_BUCKS_PARTY_CONFIG,
    },
    update: {},
  });
}

export async function getBucksPartyConfig(): Promise<BucksPartyConfigData> {
  const row = await ensureBucksPartyConfig();
  return serializeRow(row);
}

export async function updateBucksPartyConfig(
  input: BucksPartyEventUpdateInput,
  updatedByGuestId?: string,
) {
  await ensureBucksPartyConfig();

  const { startAt, endAt, ...rest } = input;
  const row = await prisma.bucksPartyConfig.update({
    where: { id: BUCKS_PARTY_CONFIG_ID },
    data: {
      ...rest,
      ...(startAt ? { startAt: new Date(startAt) } : {}),
      ...(endAt ? { endAt: new Date(endAt) } : {}),
      updatedByGuestId: updatedByGuestId ?? undefined,
    },
  });
  return serializeRow(row);
}
