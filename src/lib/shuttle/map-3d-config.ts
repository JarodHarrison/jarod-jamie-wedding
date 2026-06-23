import { getMapsApiKey } from "@/lib/shuttle/google-maps-loader";

/** Drop custom GLB exports in public/shuttle/models/ */
export const SHUTTLE_MODEL_PATHS = {
  bus: "/shuttle/models/bus.glb",
  stop: "/shuttle/models/stop.glb",
} as const;

/** Target size in meters after normalizing each model's bounding box */
export const SHUTTLE_MODEL_SIZE_METERS = {
  bus: 14,
  stop: 10,
} as const;

export const SHUTTLE_MAP_3D = {
  tilt: 58,
  defaultZoom: 13,
  busAltitudeMeters: 2,
  stopAltitudeMeters: 0,
} as const;

export function getShuttleMapsMapId() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() ?? "";
}

export function isShuttle3dEnabled() {
  return Boolean(getMapsApiKey() && getShuttleMapsMapId());
}
