import { Bus, Camera, Map, MapPinned, Shirt, Sparkles } from "lucide-react";
import type { AppTab } from "@/types/wedding";
import { GuideCard, type GuideCardConfig } from "@/components/wedding/shared/guide-card";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";
import { useWeddingPhase } from "@/components/wedding/hooks/use-wedding-phase";
import { useVenueMapAccess } from "@/components/wedding/hooks/use-venue-map-access";

const guideCards: GuideCardConfig[] = [
  {
    id: "venue-map",
    title: "Venue Map",
    description:
      "Homesteads, lawns, pool, and the walk to Lake View Deck — your illustrated Spicers map.",
    actionLabel: "Open Map",
    icon: MapPinned,
    className:
      "bg-gradient-to-br from-[#2a4a6b] via-[#3d6b8f] to-[#5a8fb0] text-white shadow-lg shadow-[#2a4a6b]/25",
    titleClassName: "text-[#d4ebf7]",
    descriptionClassName: "text-white/85",
    actionClassName: "text-[#d4ebf7]",
    iconClassName: "text-[#d4ebf7]",
  },
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

export function GuideScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  const { isFeatureVisible } = useWeddingPhase();
  const { canViewVenueMap: showVenueMap } = useVenueMapAccess();

  const visibleCards = guideCards.filter((card) => {
    if (card.id === "venue-map") return showVenueMap;
    if (card.id === "shuttle") return isFeatureVisible("live-shuttle");
    if (["attractions", "fashion", "glowup", "onsite"].includes(card.id)) {
      return isFeatureVisible("pre-wedding-planning");
    }
    return true;
  });

  return (
    <div className="animate-fade-in animate-slide-up pb-10">
      <div className="wedding-screen-top px-8 pb-6 text-center">
        <RainbowText
          as="h2"
          className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500"
        >
          Concierge
        </RainbowText>
        <RainbowText as="h1" className="font-serif text-3xl text-[var(--wedding-text-dark)]">
          Planning Guide
        </RainbowText>
      </div>

      <div className="mb-8 space-y-4 px-6">
        {visibleCards.map((card) => (
          <GuideCard key={card.id} card={card} onSelect={() => setActiveTab(card.id as AppTab)} />
        ))}
        {visibleCards.length === 0 && (
          <p className="rounded-2xl border bg-white/80 px-5 py-8 text-center text-sm text-gray-500">
            Planning guides return closer to the wedding — check back during wedding week.
          </p>
        )}
      </div>
    </div>
  );
}
