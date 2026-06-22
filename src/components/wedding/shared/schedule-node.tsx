import { ChevronRight, Clock, ExternalLink, MapPin } from "lucide-react";
import { theme } from "@/lib/theme";
import type { ScheduleBooking } from "@/types/wedding";

type ScheduleNodeProps = {
  date?: string;
  time?: string;
  title: string;
  loc?: string;
  attire?: string;
  desc?: string;
  booking?: ScheduleBooking;
};

export function ScheduleNode({ date, time, title, loc, attire, desc, booking }: ScheduleNodeProps) {
  return (
    <div className="relative pr-2 pl-12">
      <div
        className="absolute left-[20px] top-4 z-10 flex h-3 w-3 items-center justify-center rounded-full border-2 bg-white"
        style={{ borderColor: theme.gold }}
      />
      <div
        className="rounded-2xl border bg-white/80 p-4 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        {date && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            {date}
          </span>
        )}
        <div className="mb-2 flex items-start justify-between">
          <h4 className="pr-2 font-serif text-lg leading-tight text-[#2a2723]">{title}</h4>
          {time && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#f7f4ee] px-2 py-1 text-[10px] font-bold tracking-wider">
              <Clock size={10} /> {time}
            </span>
          )}
        </div>
        {desc && <p className="mb-3 text-xs leading-relaxed text-gray-600">{desc}</p>}
        {(loc || attire) && (
          <div className="mt-2 space-y-1 text-[10px] text-gray-500">
            {loc && (
              <p className="flex items-center gap-1">
                <MapPin size={10} className="text-[#c3a379]" /> {loc}
              </p>
            )}
            {attire && (
              <p className="flex items-center gap-1 italic text-gray-400">Dress: {attire}</p>
            )}
          </div>
        )}
        {booking && (
          <div className="mt-4 border-t pt-3" style={{ borderColor: theme.border }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                {booking.sub}
              </span>
              <span className="text-xs font-bold text-[#c3a379]">{booking.price}</span>
            </div>
            {booking.ext && booking.url ? (
              <a
                href={booking.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95"
                style={{ borderColor: theme.border, color: theme.textDark }}
              >
                {booking.btn} <ExternalLink size={12} />
              </a>
            ) : (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: theme.btnDark, color: theme.gold }}
              >
                {booking.btn} <ChevronRight size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
