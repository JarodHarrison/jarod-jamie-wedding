"use client";

import { useEffect, useState } from "react";
import {
  bucksPartyPunchline,
  type BucksPartyConfigData,
} from "@/lib/bucks-party-config";
import { BucksCountdown } from "@/components/bucks-party/bucks-countdown";

type Props = {
  initial: BucksPartyConfigData;
};

function useLiveBucksConfig(initial: BucksPartyConfigData) {
  const [event, setEvent] = useState(initial);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/bucks-party/config", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok && data.event) {
          setEvent(data.event as BucksPartyConfigData);
        }
      } catch {
        // keep SSR values
      }
    }

    void refresh();
    const id = window.setInterval(refresh, 30_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void refresh();
    });

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return event;
}

function GuestInfoBlock({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value?.trim()) return null;
  return (
    <div className="text-left text-white/90">
      <p className="text-[10px] font-bold uppercase tracking-widest text-pink-300/90">{label}</p>
      <div className="mt-1 space-y-1 text-sm leading-relaxed text-white/85 sm:text-base">
        {value.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}

/**
 * Re-fetches event details on the client so organiser edits show up
 * even if a prior HTML response was briefly stale.
 */
export function BucksLiveEventDetails({ initial }: Props) {
  const event = useLiveBucksConfig(initial);

  const hasGuestInfo =
    Boolean(event.dressCode?.trim()) ||
    Boolean(event.whatToBring?.trim()) ||
    Boolean(event.meetingPoint?.trim()) ||
    Boolean(event.transportNote?.trim()) ||
    Boolean(event.agendaNote?.trim()) ||
    Boolean(event.detailsNote?.trim());

  return (
    <>
      <p className="relative mt-4 font-serif text-lg text-white/80 sm:text-xl">{event.dateLabel}</p>

      <div className="relative mx-auto mt-6">
        <BucksCountdown startAt={event.startAt} />
      </div>

      <div className="space-y-1 text-white/85">
        <p>📍 Place: {event.placeLabel}</p>
        <p>⏰ Time: {event.timeLabel}</p>
        {event.placeNote ? <p className="text-white/65">({event.placeNote})</p> : null}
      </div>

      {hasGuestInfo ? (
        <div className="space-y-4 rounded-2xl border border-white/15 bg-black/20 px-4 py-4 text-left">
          <GuestInfoBlock label="Dress code" value={event.dressCode} />
          <GuestInfoBlock label="What to bring" value={event.whatToBring} />
          <GuestInfoBlock label="Meeting point" value={event.meetingPoint} />
          <GuestInfoBlock label="Transport / parking" value={event.transportNote} />
          <GuestInfoBlock label="Agenda" value={event.agendaNote} />
          <GuestInfoBlock label="Extra details" value={event.detailsNote} />
        </div>
      ) : null}
    </>
  );
}

/** Closing line from the organiser share message: stays live with config refreshes. */
export function BucksLivePunchline({ initial }: Props) {
  const event = useLiveBucksConfig(initial);

  return (
    <div className="space-y-1 font-serif text-lg text-white sm:text-xl">
      <p>{bucksPartyPunchline(event)}</p>
    </div>
  );
}
