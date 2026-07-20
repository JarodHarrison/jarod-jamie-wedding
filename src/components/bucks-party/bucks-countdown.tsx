"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; mins: number; secs: number };

function getParts(targetMs: number, now: number): Parts | null {
  const diff = targetMs - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  return { days, hours, mins, secs };
}

type BucksCountdownProps = {
  startAt: string;
};

export function BucksCountdown({ startAt }: BucksCountdownProps) {
  const targetMs = new Date(startAt).getTime();
  // null until mounted: avoids SSR/client second mismatch (hydration error)
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(getParts(targetMs, Date.now()));
    const id = window.setInterval(() => setParts(getParts(targetMs, Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (!parts) {
    return (
      <div className="bucks-countdown mx-auto grid max-w-sm grid-cols-4 gap-2" aria-hidden>
        {(["Days", "Hours", "Mins", "Secs"] as const).map((label) => (
          <div
            key={label}
            className="rounded-xl border border-white/15 bg-black/30 px-1 py-2 text-center"
          >
            <p className="font-serif text-2xl tabular-nums text-white/40 sm:text-3xl">--</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-pink-300/80">{label}</p>
          </div>
        ))}
      </div>
    );
  }

  const cells = [
    ["Days", parts.days],
    ["Hours", parts.hours],
    ["Mins", parts.mins],
    ["Secs", parts.secs],
  ] as const;

  return (
    <div className="bucks-countdown mx-auto grid max-w-sm grid-cols-4 gap-2">
      {cells.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-white/15 bg-black/30 px-1 py-2 text-center">
          <p className="font-serif text-2xl tabular-nums text-white sm:text-3xl">
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-pink-300/80">{label}</p>
        </div>
      ))}
    </div>
  );
}
