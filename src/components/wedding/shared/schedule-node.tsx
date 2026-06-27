"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight, Clock, ExternalLink, MapPin } from "lucide-react";
import { AddToCalendarButton } from "@/components/wedding/shared/add-to-calendar-button";
import { SampleMenuPanel } from "@/components/wedding/shared/sample-menu-panel";
import { theme } from "@/lib/theme";
import type { SampleMenu } from "@/lib/little-truffle-menu";
import type { ScheduleBooking } from "@/types/wedding";

export type ScheduleExtraLink = {
  label: string;
  url: string;
};

export type ScheduleNodeProps = {
  date?: string;
  time?: string;
  title: string;
  loc?: string;
  attire?: string;
  desc?: string;
  details?: string[];
  tip?: string;
  booking?: ScheduleBooking;
  extraLinks?: ScheduleExtraLink[];
  calendarEventId?: string;
  sampleMenu?: SampleMenu;
  promoImage?: string;
  defaultOpen?: boolean;
};

export function ScheduleNode({
  date,
  time,
  title,
  loc,
  attire,
  desc,
  details,
  tip,
  booking,
  extraLinks,
  calendarEventId,
  sampleMenu,
  promoImage,
  defaultOpen = false,
}: ScheduleNodeProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasBody = Boolean(
    desc || details?.length || tip || loc || attire || booking || extraLinks?.length || calendarEventId || sampleMenu || promoImage,
  );

  return (
    <div className="relative pr-2 pl-12">
      <div
        className="absolute left-[20px] top-5 z-10 flex h-3 w-3 items-center justify-center rounded-full border-2 bg-white"
        style={{ borderColor: theme.gold }}
      />
      <div
        className="overflow-hidden rounded-2xl border bg-white/80 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        <button
          type="button"
          onClick={() => hasBody && setOpen((current) => !current)}
          className={`flex w-full flex-col gap-1 p-4 text-left ${hasBody ? "cursor-pointer" : "cursor-default"}`}
          aria-expanded={hasBody ? open : undefined}
          disabled={!hasBody}
        >
          {date && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">{date}</span>
          )}
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-serif text-lg leading-tight text-[#2a2723]">{title}</h4>
            <div className="flex shrink-0 items-center gap-2">
              {time && (
                <span className="flex items-center gap-1 rounded-md bg-[#f7f4ee] px-2 py-1 text-[10px] font-bold tracking-wider">
                  <Clock size={10} /> {time}
                </span>
              )}
              {hasBody && (
                <ChevronDown
                  size={16}
                  className={`text-[#c3a379] transition-transform ${open ? "rotate-180" : ""}`}
                />
              )}
            </div>
          </div>
        </button>

        {hasBody && open && (
          <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: theme.border }}>
            {promoImage && (
              <div className="mb-3 overflow-hidden rounded-2xl border" style={{ borderColor: theme.border }}>
                <Image
                  src={promoImage}
                  alt=""
                  width={800}
                  height={500}
                  className="h-auto w-full"
                />
              </div>
            )}

            {desc && <p className="mb-3 text-xs leading-relaxed text-gray-600">{desc}</p>}

            {details && details.length > 0 && (
              <ul className="mb-3 space-y-2 text-xs leading-relaxed text-gray-600">
                {details.map((detail) => (
                  <li key={detail} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#c3a379]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}

            {sampleMenu && <SampleMenuPanel menu={sampleMenu} />}

            {tip && (
              <p className="mb-3 rounded-xl bg-[#f7f4ee] px-3 py-2 text-[11px] leading-relaxed text-[#2a2723]">
                <span className="font-bold uppercase tracking-wider text-[#c3a379]">Tip · </span>
                {tip}
              </p>
            )}

            {(loc || attire) && (
              <div className="mb-3 space-y-1 text-[10px] text-gray-500">
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
              <div className="border-t pt-3" style={{ borderColor: theme.border }}>
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
                ) : booking.url ? (
                  <a
                    href={booking.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95"
                    style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                  >
                    {booking.btn} <ChevronRight size={12} />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest opacity-50"
                    style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                  >
                    {booking.btn} <ChevronRight size={12} />
                  </button>
                )}
              </div>
            )}

            {extraLinks?.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: theme.btnDark, color: theme.gold }}
              >
                {link.label} <ExternalLink size={12} />
              </a>
            ))}

            {calendarEventId && <AddToCalendarButton eventId={calendarEventId} compact />}
          </div>
        )}
      </div>
    </div>
  );
}
