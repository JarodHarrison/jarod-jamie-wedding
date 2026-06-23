"use client";

import { useEffect, useRef, useState } from "react";
import { getMapsApiKey, loadGoogleMaps } from "@/lib/shuttle/google-maps-loader";
import {
  SHUTTLE_MAP_3D,
  getShuttleMapsMapId,
} from "@/lib/shuttle/map-3d-config";
import {
  SHUTTLE_MODEL_PATHS,
  SHUTTLE_MODEL_SIZE_METERS,
  createFallbackBus,
  createFallbackStop,
  loadShuttleModel,
  setHighlight,
} from "@/lib/shuttle/shuttle-3d-models";
import type { ShuttleMapProps } from "@/components/shuttle/shuttle-map";

type LatLng = { lat: number; lng: number };

type GoogleMapInstance = {
  fitBounds: (bounds: unknown, padding?: number) => void;
};

type GoogleMapsApi = {
  Map: new (
    el: HTMLElement,
    opts: {
      center: LatLng;
      zoom: number;
      mapId: string;
      tilt: number;
      heading: number;
      disableDefaultUI?: boolean;
      gestureHandling?: string;
    },
  ) => GoogleMapInstance;
  LatLngBounds: new () => {
    extend: (pos: LatLng) => void;
  };
};

type OverlayView = {
  scene: import("three").Scene;
  setMap: (map: GoogleMapInstance | null) => void;
  latLngAltitudeToVector3: (
    coords: { lat: number; lng: number; altitude?: number },
    target?: import("three").Vector3,
  ) => import("three").Vector3;
  requestRedraw: () => void;
};

type StopMarker = {
  stopId: string;
  object: import("three").Object3D;
};

function getGoogleMapsApi(): GoogleMapsApi | null {
  const maps = window.google?.maps as GoogleMapsApi | undefined;
  return maps ?? null;
}

export function ShuttleMap3D({ stops, busLocation, nextStopId, className }: ShuttleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const overlayRef = useRef<OverlayView | null>(null);
  const stopMarkersRef = useRef<StopMarker[]>([]);
  const busRef = useRef<import("three").Object3D | null>(null);
  const busTemplateRef = useRef<import("three").Group | null>(null);
  const stopTemplateRef = useRef<import("three").Group | null>(null);
  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const apiKey = getMapsApiKey();
    const mapId = getShuttleMapsMapId();
    if (!apiKey || !mapId || !containerRef.current || stops.length === 0) return;

    let cancelled = false;
    let animationFrame = 0;

    const init = async () => {
      setMapError("");

      try {
        await loadGoogleMaps(apiKey, () => {
          if (!cancelled) {
            setMapError(
              "Google Maps rejected this API key. Enable Maps JavaScript API, billing, and allow this site in your key restrictions.",
            );
          }
        });

        if (cancelled || !containerRef.current) return;
        const mapsApi = getGoogleMapsApi();
        if (!mapsApi) return;

        const [THREE, googleMapsThree, gltfModule] = await Promise.all([
          import("three"),
          import("@googlemaps/three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
        ]);
        const { ThreeJSOverlayView } = googleMapsThree;
        const { GLTFLoader } = gltfModule;

        const center = {
          lat: stops[0].latitude,
          lng: stops[0].longitude,
        };

        const map = new mapsApi.Map(containerRef.current, {
          center,
          zoom: SHUTTLE_MAP_3D.defaultZoom,
          mapId,
          tilt: SHUTTLE_MAP_3D.tilt,
          heading: 24,
          disableDefaultUI: true,
          gestureHandling: "greedy",
        });
        mapRef.current = map;

        const overlay = new ThreeJSOverlayView({
          map,
          anchor: { ...center, altitude: 0 },
          upAxis: "Y",
        });
        overlayRef.current = overlay as unknown as OverlayView;

        overlay.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        const sun = new THREE.DirectionalLight(0xfff2df, 0.85);
        sun.position.set(40, 120, 60);
        overlay.scene.add(sun);

        const [busTemplate, stopTemplate] = await Promise.all([
          loadShuttleModel(
            THREE,
            GLTFLoader,
            SHUTTLE_MODEL_PATHS.bus,
            createFallbackBus(THREE),
            SHUTTLE_MODEL_SIZE_METERS.bus,
          ),
          loadShuttleModel(
            THREE,
            GLTFLoader,
            SHUTTLE_MODEL_PATHS.stop,
            createFallbackStop(THREE),
            SHUTTLE_MODEL_SIZE_METERS.stop,
          ),
        ]);

        if (cancelled) return;

        busTemplateRef.current = busTemplate;
        stopTemplateRef.current = stopTemplate;
        setMapReady(true);

        const tick = (time: number) => {
          if (busRef.current) {
            busRef.current.position.y =
              SHUTTLE_MAP_3D.busAltitudeMeters + Math.sin(time * 0.002) * 0.25;
          }
          overlay.requestRedraw();
          animationFrame = requestAnimationFrame(tick);
        };
        animationFrame = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setMapError(
            "Could not start the 3D shuttle map. Confirm Maps JavaScript API, a vector Map ID, and billing are enabled.",
          );
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      stopMarkersRef.current = [];
      busRef.current = null;
      busTemplateRef.current = null;
      stopTemplateRef.current = null;
      overlayRef.current?.setMap(null);
      overlayRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
  }, [stops.length]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const busTemplate = busTemplateRef.current;
    const stopTemplate = stopTemplateRef.current;
    const map = mapRef.current;
    if (!mapReady || !overlay || !busTemplate || !stopTemplate || !map) return;

    const mapsApi = getGoogleMapsApi();
    if (!mapsApi) return;

    void import("three").then((THREE) => {
      for (const marker of stopMarkersRef.current) {
        overlay.scene.remove(marker.object);
      }
      stopMarkersRef.current = [];

      for (const stop of stops) {
        const clone = stopTemplate.clone(true);
        overlay.latLngAltitudeToVector3(
          {
            lat: stop.latitude,
            lng: stop.longitude,
            altitude: SHUTTLE_MAP_3D.stopAltitudeMeters,
          },
          clone.position,
        );
        setHighlight(clone, stop.id === nextStopId, THREE);
        overlay.scene.add(clone);
        stopMarkersRef.current.push({ stopId: stop.id, object: clone });
      }

      if (busLocation) {
        if (!busRef.current) {
          busRef.current = busTemplate.clone(true);
          overlay.scene.add(busRef.current);
        }
        overlay.latLngAltitudeToVector3(
          {
            lat: busLocation.latitude,
            lng: busLocation.longitude,
            altitude: SHUTTLE_MAP_3D.busAltitudeMeters,
          },
          busRef.current.position,
        );
        if (busLocation.heading != null) {
          busRef.current.rotation.y = THREE.MathUtils.degToRad(-busLocation.heading);
        }
      } else if (busRef.current) {
        overlay.scene.remove(busRef.current);
        busRef.current = null;
      }

      const bounds = new mapsApi.LatLngBounds();
      for (const stop of stops) {
        bounds.extend({ lat: stop.latitude, lng: stop.longitude });
      }
      if (busLocation) {
        bounds.extend({ lat: busLocation.latitude, lng: busLocation.longitude });
      }
      map.fitBounds(bounds, 56);
      overlay.requestRedraw();
    });
  }, [mapReady, stops, busLocation, nextStopId]);

  const apiKey = getMapsApiKey();
  const mapId = getShuttleMapsMapId();

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border bg-[#f0ebe3] p-6 text-center text-xs text-gray-500 ${className ?? ""}`}
      >
        Map unavailable — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the live map.
      </div>
    );
  }

  if (!mapId) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border bg-[#f0ebe3] p-6 text-center text-xs text-gray-500 ${className ?? ""}`}
      >
        3D map needs NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID (vector Map ID from Google Cloud Console).
      </div>
    );
  }

  if (mapError) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-xs text-amber-900 ${className ?? ""}`}
      >
        {mapError}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className ?? "h-64 w-full"}`}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
        3D shuttle view
      </div>
    </div>
  );
}
