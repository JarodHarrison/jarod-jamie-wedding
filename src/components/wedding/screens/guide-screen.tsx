import type { LucideIcon } from "lucide-react";
import { Bus, Camera, ChevronRight, Map, Shirt, Sparkles } from "lucide-react";
import type { AppTab } from "@/types/wedding";

type GuideCardConfig = {
  id: AppTab;
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

const guideCards: GuideCardConfig[] = [
  {
    id: "attractions",
    title: "Explore Montville",
    description: "Discover amazing local attractions, waterfalls, and oddities.",
    actionLabel: "View Guide",
    icon: Map,
    className: "bg-gradient-to-br from-[#1a3d32] via-[#245242] to-[#2f6b55] text-white shadow-lg shadow-[#1a3d32]/25",
    titleClassName: "text-[#d4e8a8]",
    descriptionClassName: "text-white/80",
    actionClassName: "text-[#d4e8a8]",
    iconClassName: "text-[#d4e8a8]",
  },
  {
    id: "fashion",
    title: "Fashion Inspiration",
    description: "Colourful cocktail looks, ASOS picks, and sequin tux energy for the big weekend.",
    actionLabel: "Get Inspired",
    icon: Shirt,
    className: "bg-gradient-to-br from-[#8b3a62] via-[#b84d7a] to-[#d46a94] text-white shadow-lg shadow-[#8b3a62]/20",
    titleClassName: "text-[#ffe4f0]",
    descriptionClassName: "text-white/85",
    actionClassName: "text-[#ffe4f0]",
    iconClassName: "text-white",
  },
  {
    id: "glowup",
    title: "Pre-Wedding Glow-Up",
    description: "Teeth whitening & Botox Pump Party. Let's get snatched!",
    actionLabel: "Register",
    icon: Sparkles,
    className: "bg-gradient-to-br from-[#9a7344] via-[#c3a379] to-[#e0c9a0] text-[#2a2723] shadow-lg shadow-[#c3a379]/30",
    titleClassName: "text-[#2a2723]",
    descriptionClassName: "text-[#2a2723]/85",
    actionClassName: "text-[#2a2723]",
    iconClassName: "text-[#2a2723]",
  },
  {
    id: "onsite",
    title: "On-Site Services",
    description: "Professional Hair, Make-up, and Barber services for the big day.",
    actionLabel: "Register",
    icon: Camera,
    className: "bg-gradient-to-br from-[#4a3d6b] via-[#6b5a8f] to-[#8a7aad] text-white shadow-lg shadow-[#4a3d6b]/20",
    titleClassName: "text-[#ede4ff]",
    descriptionClassName: "text-white/85",
    actionClassName: "text-[#ede4ff]",
    iconClassName: "text-white",
  },
  {
    id: "shuttle",
    title: "Live Wedding Shuttle",
    description:
      "Track the courtesy bus in real time — next stop, ETA, and route to Spicers Clovelly Estate.",
    actionLabel: "View Live Map",
    icon: Bus,
    className: "bg-gradient-to-br from-[#1e4a63] via-[#2d6382] to-[#3d7fa3] text-white shadow-lg shadow-[#1e4a63]/25",
    titleClassName: "text-[#c8e8f8]",
    descriptionClassName: "text-white/85",
    actionClassName: "text-[#c8e8f8]",
    iconClassName: "text-white",
  },
];

function GuideCard({
  card,
  onSelect,
}: {
  card: GuideCardConfig;
  onSelect: (tab: AppTab) => void;
}) {
  const Icon = card.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(card.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(card.id);
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl p-6 transition-transform active:scale-95 ${card.className}`}
    >
      <div
        className={`pointer-events-none absolute right-3 top-3 opacity-[0.22] ${card.iconClassName}`}
        aria-hidden="true"
      >
        <Icon size={64} strokeWidth={2} />
      </div>
      <h3 className={`relative mb-1 font-serif text-2xl ${card.titleClassName}`}>{card.title}</h3>
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

export function GuideScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-up pb-10">
      <div className="wedding-screen-top px-8 pb-6 text-center">
        <h2 className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500">Concierge</h2>
        <h1 className="font-serif text-3xl text-[#2a2723]">Planning Guide</h1>
      </div>

      <div className="mb-8 space-y-4 px-6">
        {guideCards.map((card) => (
          <GuideCard key={card.id} card={card} onSelect={setActiveTab} />
        ))}
      </div>
    </div>
  );
}
