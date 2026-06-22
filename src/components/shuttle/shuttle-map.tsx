"use client";

import { useEffect, useRef } from "react";
import type { ShuttleStopView } from "@/types/shuttle";

type ShuttleMapProps = {
  stops: ShuttleStopView[];
  busLocation: { latitude: number; longitude: number } | null;
  nextStopId?: string | null;
  className?: string;
};

type GoogleMap = {
  setCenter: (pos: { lat: number; lng: number }) => void;
  fitBounds: (bounds: unknown) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
  setPosition: (pos: { lat: number; lng: number }) => void;
};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          el: HTMLElement,
          opts: { center: { lat: number; lng: number }; zoom: number; disableDefaultUI?: boolean },
        ) => GoogleMap;
        Marker: new (opts: {
          map: GoogleMap;
          position: { lat: number; lng: number };
          title?: string;
          label?: string;
          icon?: string;
        }) => GoogleMarker;
        LatLngBounds: new () => {
          extend: (pos: { lat: number; lng: number }) => void;
        };
      };
    };
  }
}

const MAPS_SCRIPT_ID = "google-maps-shuttle";

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();

  const existing = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Maps failed to load")));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Maps failed to load"));
    document.head.appendChild(script);
  });
}

export function ShuttleMap({ stops, busLocation, nextStopId, className }: ShuttleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const busMarkerRef = useRef<GoogleMarker | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !containerRef.current || stops.length === 0) return;

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.maps) return;

        const center = busLocation ?? {
          latitude: stops[0].latitude,
          longitude: stops[0].longitude,
        };

        if (!mapRef.current) {
          mapRef.current = new window.google.maps.Map(containerRef.current, {
            center: { lat: center.latitude, lng: center.longitude },
            zoom: 12,
            disableDefaultUI: true,
          });
        }

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const bounds = new window.google.maps.LatLngBounds();

        for (const stop of stops) {
          const marker = new window.google.maps.Marker({
            map: mapRef.current,
            position: { lat: stop.latitude, lng: stop.longitude },
            title: stop.name,
            label: stop.id === nextStopId ? "★" : String(stop.stopOrder),
          });
          markersRef.current.push(marker);
          bounds.extend({ lat: stop.latitude, lng: stop.longitude });
        }

        if (busLocation) {
          if (!busMarkerRef.current) {
            busMarkerRef.current = new window.google.maps.Marker({
              map: mapRef.current,
              position: { lat: busLocation.latitude, lng: busLocation.longitude },
              title: "Shuttle",
              label: "🚌",
            });
          } else {
            busMarkerRef.current.setPosition({
              lat: busLocation.latitude,
              lng: busLocation.longitude,
            });
          }
          bounds.extend({ lat: busLocation.latitude, lng: busLocation.longitude });
        } else if (busMarkerRef.current) {
          busMarkerRef.current.setMap(null);
          busMarkerRef.current = null;
        }

        mapRef.current.fitBounds(bounds);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [stops, busLocation, nextStopId]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border bg-[#f0ebe3] p-6 text-center text-xs text-gray-500 ${className ?? ""}`}
      >
        Map unavailable — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the live map.
      </div>
    );
  }

  return <div ref={containerRef} className={`rounded-2xl bg-[#e8e0d4] ${className ?? "h-64 w-full"}`} />;
}
