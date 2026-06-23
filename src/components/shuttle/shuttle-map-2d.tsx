"use client";

import { useEffect, useRef, useState } from "react";
import { getMapsApiKey, loadGoogleMaps } from "@/lib/shuttle/google-maps-loader";
import type { ShuttleMapProps } from "@/components/shuttle/shuttle-map";

type GoogleMap = {
  fitBounds: (bounds: unknown) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
  setPosition: (pos: { lat: number; lng: number }) => void;
};

type GoogleMapsApi = {
  Map: new (
    el: HTMLElement,
    opts: { center: { lat: number; lng: number }; zoom: number; disableDefaultUI?: boolean },
  ) => GoogleMap;
  Marker: new (opts: {
    map: GoogleMap;
    position: { lat: number; lng: number };
    title?: string;
    label?: string;
  }) => GoogleMarker;
  LatLngBounds: new () => {
    extend: (pos: { lat: number; lng: number }) => void;
  };
};

function getGoogleMapsApi(): GoogleMapsApi | null {
  return (window.google?.maps as GoogleMapsApi | undefined) ?? null;
}

export function ShuttleMap2D({ stops, busLocation, nextStopId, className }: ShuttleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const busMarkerRef = useRef<GoogleMarker | null>(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    const apiKey = getMapsApiKey();
    if (!apiKey || !containerRef.current || stops.length === 0) return;

    let cancelled = false;
    setMapError("");

    loadGoogleMaps(apiKey, () => {
      if (!cancelled) {
        setMapError(
          "Google Maps rejected this API key. Enable Maps JavaScript API, billing, and allow this site in your key restrictions.",
        );
      }
    })
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const mapsApi = getGoogleMapsApi();
        if (!mapsApi) return;

        const center = busLocation ?? {
          latitude: stops[0].latitude,
          longitude: stops[0].longitude,
        };

        if (!mapRef.current) {
          mapRef.current = new mapsApi.Map(containerRef.current, {
            center: { lat: center.latitude, lng: center.longitude },
            zoom: 12,
            disableDefaultUI: true,
          });
        }

        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const bounds = new mapsApi.LatLngBounds();

        for (const stop of stops) {
          const marker = new mapsApi.Marker({
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
            busMarkerRef.current = new mapsApi.Marker({
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
      .catch(() => {
        if (!cancelled) setMapError("Could not load Google Maps. Check your API key and network connection.");
      });

    return () => {
      cancelled = true;
    };
  }, [stops, busLocation, nextStopId]);

  const apiKey = getMapsApiKey();

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border bg-[#f0ebe3] p-6 text-center text-xs text-gray-500 ${className ?? ""}`}
      >
        Map unavailable — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the live map.
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

  return <div ref={containerRef} className={`rounded-2xl bg-[#e8e0d4] ${className ?? "h-64 w-full"}`} />;
}
