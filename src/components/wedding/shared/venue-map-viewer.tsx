"use client";

import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { VENUE_MAP_IMAGE } from "@/lib/venue-map";
import { theme } from "@/lib/theme";

type VenueMapViewerProps = {
  compact?: boolean;
};

export function VenueMapViewer({ compact = false }: VenueMapViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const mapImage = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={VENUE_MAP_IMAGE}
      alt="Jarod and Jamie venue map — Spicers Clovelly Estate"
      className={`block ${compact ? "min-w-[520px]" : "min-w-[640px]"} w-max max-w-none`}
      draggable={false}
    />
  );

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border bg-[#f7f4ee] shadow-sm ${
          compact ? "" : "mt-4"
        }`}
        style={{ borderColor: theme.border }}
      >
        <div className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:thin]">
          <div className="p-3">{mapImage}</div>
        </div>
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest shadow-md"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          <Maximize2 size={12} />
          Full screen
        </button>
      </div>
      <p className={`text-xs leading-relaxed text-gray-500 ${compact ? "mt-2" : "mt-3 px-1"}`}>
        Pinch or scroll sideways to explore. Homesteads, lawns, pool, and the path to Lake View Deck
        are labelled on the map.
      </p>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Venue map full screen"
        >
          <div className="flex shrink-0 items-center justify-between px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">Venue map</p>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="rounded-full p-2 text-white/80 hover:bg-white/10"
              aria-label="Close full screen map"
            >
              <X size={20} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="mx-auto w-max">{mapImage}</div>
          </div>
        </div>
      )}
    </>
  );
}
