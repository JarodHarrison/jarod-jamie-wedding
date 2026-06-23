"use client";

import { useEffect, useState } from "react";
import { WEDDING_CEREMONY_ISO } from "@/lib/wedding-date";

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-10 flex-col items-center">
      <span className="font-serif text-2xl text-[#2a2723]">{value}</span>
      <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = new Date(WEDDING_CEREMONY_ISO).getTime();

    const update = () => {
      const difference = targetDate - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <TimeBox value={timeLeft.days} label="Days" />
      <span className="pb-3 font-serif text-xl text-[#c3a379]">:</span>
      <TimeBox value={timeLeft.hours} label="Hours" />
      <span className="pb-3 font-serif text-xl text-[#c3a379]">:</span>
      <TimeBox value={timeLeft.mins} label="Mins" />
      <span className="pb-3 font-serif text-xl text-[#c3a379]">:</span>
      <TimeBox value={timeLeft.secs} label="Secs" />
    </div>
  );
}
