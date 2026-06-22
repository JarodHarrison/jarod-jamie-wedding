import type { ShuttleStopStatusType } from "@prisma/client";

export type ShuttleStopView = {
  id: string;
  slug: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  status: ShuttleStopStatusType;
  arrivedAt: string | null;
  departedAt: string | null;
};

export type ShuttleEtaView = {
  durationText: string;
  arrivalIso: string;
  arrivalLabel: string;
} | null;

export type ShuttleLiveState = {
  visible: boolean;
  tracking: boolean;
  message: string;
  sessionId: string | null;
  driverName: string | null;
  startedAt: string | null;
  location: {
    latitude: number;
    longitude: number;
    heading: number | null;
    speed: number | null;
    recordedAt: string;
  } | null;
  stops: ShuttleStopView[];
  nextStop: ShuttleStopView | null;
  venue: ShuttleStopView | null;
  etas: {
    nextStop: ShuttleEtaView;
    venue: ShuttleEtaView;
  };
};
