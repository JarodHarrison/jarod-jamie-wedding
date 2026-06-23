"use client";

import type { ShuttleStopView } from "@/types/shuttle";
import { isShuttle3dEnabled } from "@/lib/shuttle/map-3d-config";
import { ShuttleMap2D } from "@/components/shuttle/shuttle-map-2d";
import { ShuttleMap3D } from "@/components/shuttle/shuttle-map-3d";

export type ShuttleMapProps = {
  stops: ShuttleStopView[];
  busLocation: {
    latitude: number;
    longitude: number;
    heading?: number | null;
  } | null;
  nextStopId?: string | null;
  className?: string;
};

export function ShuttleMap(props: ShuttleMapProps) {
  if (isShuttle3dEnabled()) {
    return <ShuttleMap3D {...props} />;
  }
  return <ShuttleMap2D {...props} />;
}
