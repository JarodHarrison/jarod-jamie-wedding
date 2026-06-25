"use client";

import { CalendarPlus } from "lucide-react";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar-links";
import { getCalendarEvent } from "@/lib/wedding-calendar-events";
import { theme } from "@/lib/theme";

type AddToCalendarButtonProps = {
  eventId: string;
  compact?: boolean;
};

export function AddToCalendarButton({ eventId, compact = false }: AddToCalendarButtonProps) {
  const event = getCalendarEvent(eventId);
  if (!event) return null;

  const icsUrl = `/api/calendar/${eventId}`;

  return (
    <div className={compact ? "mt-3" : "mt-4"}>
      <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
        Add to calendar
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-transform active:scale-95"
          style={{ borderColor: theme.border, color: theme.textDark }}
        >
          <CalendarPlus size={12} />
          Google
        </a>
        <a
          href={outlookCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-transform active:scale-95"
          style={{ borderColor: theme.border, color: theme.textDark }}
        >
          <CalendarPlus size={12} />
          Outlook
        </a>
        <a
          href={icsUrl}
          download={`${eventId}.ics`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-transform active:scale-95"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          <CalendarPlus size={12} />
          Apple / ICS
        </a>
      </div>
    </div>
  );
}
