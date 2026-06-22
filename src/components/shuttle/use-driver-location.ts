"use client";

import { useEffect, useRef, useState } from "react";

type Position = {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
};

export function useDriverLocationTracking(active: boolean) {
  const [error, setError] = useState("");
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const latestRef = useRef<Position | null>(null);
  const sendingRef = useRef(false);

  const sendPosition = async (position: Position) => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    try {
      const res = await fetch("/api/shuttle/driver/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(position),
      });
      if (res.ok) {
        const data = await res.json();
        setLastSentAt(data.location?.recordedAt ?? new Date().toISOString());
        setError("");
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to upload location.");
      }
    } catch {
      setError("Network error uploading location.");
    } finally {
      sendingRef.current = false;
    }
  };

  useEffect(() => {
    if (!active) {
      latestRef.current = null;
      return;
    }

    if (!navigator.geolocation) {
      setError("Location is not supported on this device.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        latestRef.current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
        };
        setError("");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. Enable location to track the shuttle.");
        } else {
          setError("Unable to read GPS location. Keep this screen open and try again.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    const interval = window.setInterval(() => {
      if (latestRef.current) {
        void sendPosition(latestRef.current);
      }
    }, 8000);

    if (latestRef.current) {
      void sendPosition(latestRef.current);
    }

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearInterval(interval);
    };
  }, [active]);

  return { error, lastSentAt };
}
