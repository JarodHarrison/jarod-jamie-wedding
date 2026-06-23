declare module "@googlemaps/three" {
  import type * as THREE from "three";

  export type ThreeJSOverlayViewOptions = {
    map: unknown;
    anchor: { lat: number; lng: number; altitude?: number };
    upAxis?: "X" | "Y" | "Z" | THREE.Vector3;
  };

  export class ThreeJSOverlayView {
    constructor(options: ThreeJSOverlayViewOptions);
    scene: THREE.Scene;
    setMap(map: unknown | null): void;
    latLngAltitudeToVector3(
      coords: { lat: number; lng: number; altitude?: number },
      target?: THREE.Vector3,
    ): THREE.Vector3;
    requestRedraw(): void;
    onBeforeDraw: (() => void) | null;
  }
}
