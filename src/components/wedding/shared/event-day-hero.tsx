"use client";

import { Bus, Clock, Phone, Sparkles } from "lucide-react";
import { WeddingWeather } from "@/components/wedding/shared/wedding-weather";
import { useWeddingPhase } from "@/components/wedding/hooks/use-wedding-phase";
import { EMERGENCY_CONTACTS, getDaySchedule } from "@/lib/wedding-event";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type EventDayHeroProps = {
  setActiveTab: (tab: AppTab) => void;
  onOpenChat?: () => void;
};

export function EventDayHero({ setActiveTab, onOpenChat }: EventDayHeroProps) {
  const { isFeatureVisible } = useWeddingPhase();
  const schedule = getDaySchedule();
  const showBingo = isFeatureVisible("photobooth-bingo");
  const showShuttle = isFeatureVisible("live-shuttle");
  const showEmergency = isFeatureVisible("emergency-contacts");

  return (
    <section className="mb-8 space-y-4 px-6">
      <div
        className="overflow-hidden rounded-3xl border shadow-lg"
        style={{ borderColor: theme.border, background: "linear-gradient(135deg, #2a2723 0%, #4a3d35 100%)" }}
      >
        <div className="px-6 py-6 text-center text-white">
          <div className="mb-2 flex items-center justify-center gap-2 text-[var(--wedding-gold)]">
            <Sparkles size={14} />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em]">Today&apos;s the day</p>
            <Sparkles size={14} />
          </div>
          <h2 className="font-serif text-3xl">Jarod & Jamie</h2>
          <p className="mt-1 text-sm text-white/80">Spicers Clovelly Estate · Montville</p>
          <div className="mt-4 flex justify-center">
            <WeddingWeather variant="overlay" className="max-w-xs" />
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/20 px-5 py-4">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--wedding-gold)]">
            <Clock size={12} /> Today&apos;s schedule
          </p>
          <ul className="space-y-3">
            {schedule.map((item) => (
              <li key={item.label} className="flex gap-3 text-sm text-white/90">
                <span className="w-16 shrink-0 font-bold text-[var(--wedding-gold)]">{item.time}</span>
                <span>
                  <span className="font-medium">{item.label}</span>
                  <span className="block text-xs text-white/60">{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`grid gap-3 ${showBingo && showShuttle ? "grid-cols-2" : "grid-cols-1"}`}>
        <button
          type="button"
          onClick={() => setActiveTab("itinerary")}
          className="rounded-2xl border bg-white p-4 text-left shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Clock size={18} className="mb-2 text-[var(--wedding-gold)]" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Full itinerary</p>
        </button>
        {showBingo && (
        <button
          type="button"
          onClick={() => setActiveTab("bingo")}
          className="rounded-2xl border bg-white p-4 text-left shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Sparkles size={18} className="mb-2 text-pink-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Photobooth bingo</p>
        </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("jarodjamie")}
          className="rounded-2xl border bg-white p-4 text-left shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Sparkles size={18} className="mb-2 text-violet-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Story wall</p>
        </button>
        {showShuttle ? (
        <button
          type="button"
          onClick={() => setActiveTab("shuttle")}
          className="rounded-2xl border bg-white p-4 text-left shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Bus size={18} className="mb-2 text-emerald-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Live shuttle</p>
        </button>
        ) : (
        <button
          type="button"
          onClick={onOpenChat}
          className="rounded-2xl border bg-white p-4 text-left shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Bus size={18} className="mb-2 text-emerald-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Shuttle & FAQs</p>
        </button>
        )}
      </div>

      {showEmergency && (
      <div
        className="rounded-2xl border bg-white p-4"
        style={{ borderColor: theme.border }}
      >
        <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Phone size={12} /> Need us on the day?
        </p>
        <div className="flex flex-wrap gap-3">
          {EMERGENCY_CONTACTS.map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="rounded-xl border px-3 py-2 text-sm font-medium text-[var(--wedding-text-dark)]"
              style={{ borderColor: theme.border }}
            >
              {contact.name} · {contact.phone}
            </a>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
