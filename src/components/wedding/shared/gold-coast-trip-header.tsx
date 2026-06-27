"use client";

import { ChevronRight } from "lucide-react";
import {
  GOLD_COAST_TRIP_ALACARTE_NOTE,
  GOLD_COAST_TRIP_DATES,
  GOLD_COAST_TRIP_INTRO,
  GOLD_COAST_TRIP_PENTHOUSE_NOTE,
} from "@/lib/gold-coast-trip";
import { getGoldCoastStripeUrl } from "@/lib/gold-coast-stripe";
import { theme } from "@/lib/theme";

type GoldCoastTripHeaderProps = {
  isPenthouse: boolean;
};

export function GoldCoastTripHeader({ isPenthouse }: GoldCoastTripHeaderProps) {
  const gcueUrl = getGoldCoastStripeUrl("gcue");
  const penthouseUrl = getGoldCoastStripeUrl("penthouse");

  return (
    <div
      className="rounded-3xl border bg-white/80 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
        {GOLD_COAST_TRIP_DATES}
      </p>
      <h3 className="mt-1 font-serif text-xl text-[#2a2723]">Pre-Wedding Gold Coast Trip</h3>
      <p className="mt-3 text-xs leading-relaxed text-gray-600">{GOLD_COAST_TRIP_INTRO}</p>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        {isPenthouse ? GOLD_COAST_TRIP_PENTHOUSE_NOTE : GOLD_COAST_TRIP_ALACARTE_NOTE}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {gcueUrl ? (
          <a
            href={gcueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-2xl px-4 py-3.5 shadow-md transition-transform active:scale-[0.98]"
            style={{ backgroundColor: theme.gold, color: theme.btnDark }}
          >
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Recommended · all in</span>
            <span className="mt-1 flex items-center justify-between gap-2 font-serif text-base">
              Ultimate Experience
              <ChevronRight size={16} className="shrink-0" />
            </span>
            <span className="mt-1 text-[10px] opacity-80">Penthouse, parks, dinners &amp; zoo</span>
          </a>
        ) : (
          <div
            className="rounded-2xl border px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-400"
            style={{ borderColor: theme.border }}
          >
            Ultimate Experience — link coming soon
          </div>
        )}

        {penthouseUrl ? (
          <a
            href={penthouseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-2xl border px-4 py-3.5 transition-transform active:scale-[0.98]"
            style={{ borderColor: theme.border, color: theme.textDark }}
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#c3a379]">
              À la carte · stay only
            </span>
            <span className="mt-1 flex items-center justify-between gap-2 font-serif text-base text-[#2a2723]">
              Accommodation Only
              <ChevronRight size={16} className="shrink-0 text-[#c3a379]" />
            </span>
            <span className="mt-1 text-[10px] text-gray-500">$550/person · 3 nights penthouse</span>
          </a>
        ) : (
          <div
            className="rounded-2xl border px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-400"
            style={{ borderColor: theme.border }}
          >
            Accommodation only — link coming soon
          </div>
        )}
      </div>
    </div>
  );
}
