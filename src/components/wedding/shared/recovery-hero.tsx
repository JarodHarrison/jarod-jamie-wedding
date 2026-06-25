"use client";

import { Camera, Heart, Sparkles } from "lucide-react";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type RecoveryHeroProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function RecoveryHero({ setActiveTab }: RecoveryHeroProps) {
  return (
    <section className="mb-8 space-y-4 px-6">
      <div
        className="overflow-hidden rounded-3xl border px-6 py-8 text-center shadow-lg"
        style={{
          borderColor: theme.border,
          background: "linear-gradient(135deg, #2a2723 0%, #4a3d35 55%, #6b5344 100%)",
        }}
      >
        <div className="mb-2 flex items-center justify-center gap-2 text-[var(--wedding-gold)]">
          <Sparkles size={14} />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em]">What a weekend</p>
          <Sparkles size={14} />
        </div>
        <h2 className="font-serif text-3xl text-white">Thank you for celebrating with us</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/80">
          Relive the magic — share photos, read the story wall, and soak up the memories while we recover.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className="rounded-2xl border bg-white p-4 text-left shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Camera size={18} className="mb-2 text-[var(--wedding-gold)]" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Photos</p>
          <p className="mt-1 text-sm text-[var(--wedding-text-dark)]">Hashtag & booth</p>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("jarodjamie")}
          className="rounded-2xl border bg-white p-4 text-left shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Heart size={18} className="mb-2 text-pink-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Story wall</p>
          <p className="mt-1 text-sm text-[var(--wedding-text-dark)]">Guest memories</p>
        </button>
      </div>
    </section>
  );
}
