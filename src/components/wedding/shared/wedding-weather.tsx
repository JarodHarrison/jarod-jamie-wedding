"use client";

import { useEffect, useState } from "react";
import type { WeddingWeatherPayload } from "@/lib/weather/montville-wedding-weather";

type WeddingWeatherProps = {
  variant?: "card" | "overlay";
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
};

export function WeddingWeather({ variant = "card", className = "", onClick }: WeddingWeatherProps) {
  const [weather, setWeather] = useState<WeddingWeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const isOverlay = variant === "overlay";

  useEffect(() => {
    fetch("/api/weather/wedding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setWeather(data))
      .catch(() => setWeather(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    if (isOverlay) {
      return (
        <div
          className={`w-full rounded-2xl border border-white/35 bg-white/20 px-3 py-2 text-center shadow-lg backdrop-blur-md ${className}`}
          onClick={onClick}
        >
          <p className="text-[10px] font-medium tracking-wide text-white/80">Montville weather…</p>
        </div>
      );
    }
    return (
      <div className={`mx-6 mb-6 rounded-2xl border border-[#e8e0d4] bg-white/80 px-4 py-3 text-center text-xs text-gray-400 ${className}`}>
        Checking Montville weather…
      </div>
    );
  }

  if (!weather) return null;

  const modeLabel =
    weather.mode === "forecast"
      ? "Live forecast"
      : weather.mode === "typical"
        ? "Typical late Sep"
        : "Montville";

  if (isOverlay) {
    return (
      <div
        className={`rounded-2xl border border-white/40 bg-white/25 px-3 py-2 shadow-lg backdrop-blur-md ${className}`}
        onClick={onClick}
        role="note"
        aria-label={`Weather for ${weather.weddingDateLabel}: ${weather.headline}, ${weather.lowC} to ${weather.highC} degrees`}
      >
        <p className="text-center text-[9px] font-bold uppercase tracking-[0.14em] text-white/75">
          {modeLabel}
        </p>
        <div className="mt-1 flex items-center justify-center gap-2.5">
          <span className="text-lg leading-none" aria-hidden="true">
            {weather.emoji}
          </span>
          <p className="text-xs font-semibold text-white">{weather.headline}</p>
          {weather.highC != null && weather.lowC != null && (
            <p className="text-[11px] text-white/90">
              {weather.lowC}°–{weather.highC}°C
            </p>
          )}
          {weather.rainChancePercent != null && (
            <p className="text-[9px] text-white/70">{weather.rainChancePercent}% rain</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className={`mx-6 mb-6 rounded-2xl border border-[#e8e0d4] bg-white p-4 shadow-sm ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{modeLabel}</p>
      <p className="font-serif text-lg text-[#2a2723]">{weather.weddingDateLabel}</p>
      <p className="text-xs text-gray-500">{weather.location}</p>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">
          {weather.emoji}
        </span>
        <div>
          <p className="font-medium text-[#2a2723]">{weather.headline}</p>
          {weather.highC != null && weather.lowC != null && (
            <p className="text-sm text-gray-600">
              {weather.lowC}°C – {weather.highC}°C
            </p>
          )}
          {weather.rainChancePercent != null && (
            <p className="text-xs text-gray-500">{weather.rainChancePercent}% chance of rain</p>
          )}
        </div>
      </div>

      {weather.currentMontville && weather.mode === "typical" && (
        <p className="mt-3 border-t border-[#e8e0d4] pt-3 text-xs text-gray-500">
          Montville now: {weather.currentMontville.emoji} {weather.currentMontville.tempC}°C
        </p>
      )}

      {weather.note && <p className="mt-2 text-[10px] leading-relaxed text-gray-400">{weather.note}</p>}
    </section>
  );
}
