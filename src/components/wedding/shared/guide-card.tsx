"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";

export type GuideCardConfig = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  className: string;
  titleClassName: string;
  descriptionClassName: string;
  actionClassName: string;
  iconClassName: string;
};

type GuideCardProps = {
  card: GuideCardConfig;
  onSelect: () => void;
};

export function GuideCard({ card, onSelect }: GuideCardProps) {
  const Icon = card.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl p-6 transition-transform active:scale-95 ${card.className}`}
    >
      <div
        className={`pointer-events-none absolute right-3 top-3 opacity-[0.22] ${card.iconClassName}`}
        aria-hidden="true"
      >
        <Icon size={64} strokeWidth={2} />
      </div>
      <RainbowText
        as="h3"
        preserveColor
        className={`relative mb-1 font-serif text-2xl ${card.titleClassName}`}
      >
        {card.title}
      </RainbowText>
      <p className={`relative mb-4 max-w-[80%] text-sm ${card.descriptionClassName}`}>
        {card.description}
      </p>
      <span
        className={`relative flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${card.actionClassName}`}
      >
        {card.actionLabel} <ChevronRight size={12} />
      </span>
    </div>
  );
}
