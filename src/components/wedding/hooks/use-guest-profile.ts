"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestProfile } from "@/types/wedding";

export function useGuestProfile() {
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/guest/profile");
      if (res.status === 401) {
        setProfile(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load profile.");
        return;
      }
      setProfile(data.profile);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveSection = async (section: string, payload: Record<string, unknown>) => {
    setError("");
    const res = await fetch("/api/guest/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      return { ok: false as const };
    }
    setProfile(data.profile);
    if (data.tierUpdated && data.profile?.tier) {
      window.dispatchEvent(
        new CustomEvent("wedding:guest-tier", { detail: data.profile.tier }),
      );
    }
    return { ok: true as const, tierUpdated: Boolean(data.tierUpdated) };
  };

  return { profile, loading, error, saveSection, reload: loadProfile, setError };
}
