"use client";

import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar-links";
import { bucksPartyCalendarEvent } from "@/lib/bucks-party-config";
import type { BucksPartyConfigData } from "@/lib/bucks-party-config";
import type { WeddingCalendarEvent } from "@/lib/wedding-calendar-events";

export function BucksCalendarActions() {
  const [event, setEvent] = useState<WeddingCalendarEvent | null>(null);
  const [timeLabel, setTimeLabel] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/bucks-party/config");
        const data = await res.json();
        if (res.ok && data.event) {
          const cfg = data.event as BucksPartyConfigData;
          setEvent(bucksPartyCalendarEvent(cfg));
          setTimeLabel(cfg.timeLabel);
        }
      } catch {
        setEvent(null);
      }
    })();
  }, []);

  if (!event) return null;

  const icsUrl = "/api/calendar/bucks-party";

  return (
    <div className="space-y-2">
      <p className="text-center text-[10px] font-bold uppercase tracking-widest text-pink-300">
        Save the date
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
        >
          <CalendarPlus size={12} /> Google
        </a>
        <a
          href={outlookCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white"
        >
          <CalendarPlus size={12} /> Outlook
        </a>
        <a
          href={icsUrl}
          download="bucks-party.ics"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#1a0f24]"
        >
          <CalendarPlus size={12} /> Apple / ICS
        </a>
      </div>
      {timeLabel ? (
        <p className="text-center text-[11px] text-white/55">
          {timeLabel === "Coming Soon" || timeLabel === "TBC"
            ? "Time TBA. We'll update when locked in"
            : `Scheduled for ${timeLabel}`}
        </p>
      ) : null}
    </div>
  );
}
