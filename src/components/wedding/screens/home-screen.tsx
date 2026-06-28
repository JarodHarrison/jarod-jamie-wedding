import {
  Camera,
  ChevronRight,
  Crown,
  Gift,
  Heart,
  Info,
  MapPin,
  MapPinned,
  MessageCircle,
  Plane,
  Users,
} from "lucide-react";
import { Countdown } from "@/components/wedding/shared/countdown";
import { EventDayHero } from "@/components/wedding/shared/event-day-hero";
import { RecoveryHero } from "@/components/wedding/shared/recovery-hero";
import { GuestPhotoWall } from "@/components/wedding/shared/guest-photo-wall";
import { GuideCard, type GuideCardConfig } from "@/components/wedding/shared/guide-card";
import { HeroImage } from "@/components/wedding/shared/hero-image";
import { HomeHeaderActions } from "@/components/wedding/shared/home-header-actions";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";
import { WeddingChecklist } from "@/components/wedding/shared/wedding-checklist";
import { WeddingWeather } from "@/components/wedding/shared/wedding-weather";
import { HomeWhereImStaying } from "@/components/wedding/shared/home-where-im-staying";
import { useWeddingPhase } from "@/components/wedding/hooks/use-wedding-phase";
import { useVenueMapAccess } from "@/components/wedding/hooks/use-venue-map-access";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type HomeScreenProps = {
  setActiveTab: (tab: AppTab) => void;
  onLogout?: () => void;
  userName: string;
  onOpenChat?: () => void;
  onOpenInstall?: () => void;
  canVerifyBingo?: boolean;
};

function buildHomeCards(onOpenChat?: () => void, showBingoPromo = false): Array<GuideCardConfig & { action: () => void }> {
  return [
    {
      id: "jarodjamie",
      title: "Jarod & Jamie",
      description: "Share a funny memory, heartfelt moment, or chaos — on the story wall for everyone.",
      actionLabel: "Share Yours",
      icon: Heart,
      className:
        "bg-gradient-to-br from-[#9a7344] via-[#c3a379] to-[#e8d5b5] text-[#2a2723] shadow-lg shadow-[#c3a379]/25",
      titleClassName: "text-[#2a2723]",
      descriptionClassName: "text-[#2a2723]/85",
      actionClassName: "text-[#2a2723]",
      iconClassName: "text-[#2a2723]",
      action: () => {},
    },
    {
      id: "annita",
      title: "Annita Help",
      description: "Your glam concierge for dress code, shuttles, RSVP drama, and FAQs.",
      actionLabel: "Ask Annita",
      icon: MessageCircle,
      className:
        "bg-gradient-to-br from-[#8b3a62] via-[#c026d3] to-[#ec4899] text-white shadow-lg shadow-[#c026d3]/25",
      titleClassName: "text-[#ffe4f0]",
      descriptionClassName: "text-white/85",
      actionClassName: "text-[#ffe4f0]",
      iconClassName: "text-white",
      action: () => onOpenChat?.(),
    },
    {
      id: "photos",
      title: "Photos & Booth",
      description: showBingoPromo
        ? "Hashtag wall, booth downloads, and photobooth bingo — strike a pose."
        : "Hashtag wall and booth downloads — share your favourite moments.",
      actionLabel: "Open Gallery",
      icon: Camera,
      className:
        "bg-gradient-to-br from-[#4a3d6b] via-[#7c3aed] to-[#a78bfa] text-white shadow-lg shadow-[#7c3aed]/20",
      titleClassName: "text-[#ede4ff]",
      descriptionClassName: "text-white/85",
      actionClassName: "text-[#ede4ff]",
      iconClassName: "text-white",
      action: () => {},
    },
    {
      id: "wishingwell",
      title: "Wishing Well",
      description: "Your presence is the gift — but if you'd like to bless us, tap here.",
      actionLabel: "Contribute",
      icon: Gift,
      className:
        "bg-gradient-to-br from-[#1a3d32] via-[#245242] to-[#2f6b55] text-white shadow-lg shadow-[#1a3d32]/25",
      titleClassName: "text-[#d4e8a8]",
      descriptionClassName: "text-white/80",
      actionClassName: "text-[#d4e8a8]",
      iconClassName: "text-[#d4e8a8]",
      action: () => {},
    },
    {
      id: "travel",
      title: "Travel & Stay",
      description: "Accommodation, airport transfers, taxis, and getting to Montville.",
      actionLabel: "Plan Trip",
      icon: Plane,
      className:
        "bg-gradient-to-br from-[#1e4a63] via-[#2d6382] to-[#3d7fa3] text-white shadow-lg shadow-[#1e4a63]/25",
      titleClassName: "text-[#c8e8f8]",
      descriptionClassName: "text-white/85",
      actionClassName: "text-[#c8e8f8]",
      iconClassName: "text-white",
      action: () => {},
    },
    {
      id: "party",
      title: "Wedding Party",
      description: "Meet the bridal party, family, and the legends in our corner.",
      actionLabel: "View Party",
      icon: Users,
      className:
        "bg-gradient-to-br from-[#6b4c35] via-[#8b6914] to-[#c3a379] text-white shadow-lg shadow-[#8b6914]/20",
      titleClassName: "text-[#fef3c7]",
      descriptionClassName: "text-white/85",
      actionClassName: "text-[#fef3c7]",
      iconClassName: "text-white",
      action: () => {},
    },
    {
      id: "faq",
      title: "FAQs",
      description: "Kids, venue, surprises — everything you were too polite to ask.",
      actionLabel: "View Answers",
      icon: Info,
      className:
        "bg-gradient-to-br from-[#5c5348] via-[#7a6f62] to-[#9a8f82] text-white shadow-lg shadow-[#5c5348]/20",
      titleClassName: "text-[#f7f4ee]",
      descriptionClassName: "text-white/85",
      actionClassName: "text-[#f7f4ee]",
      iconClassName: "text-white",
      action: () => {},
    },
  ];
}

const PLANNING_CARD_IDS = new Set(["travel", "wishingwell"]);

export function HomeScreen({
  setActiveTab,
  onLogout,
  userName,
  onOpenChat,
  onOpenInstall,
  canVerifyBingo = false,
}: HomeScreenProps) {
  const { phase, isFeatureVisible } = useWeddingPhase();
  const { canViewVenueMap: showVenueMap } = useVenueMapAccess();
  const showBingo = isFeatureVisible("photobooth-bingo");
  const showGuestPic = isFeatureVisible("guest-pic");

  const homeCards = buildHomeCards(onOpenChat, showBingo)
    .filter((card) => {
      if (card.id === "travel" && !isFeatureVisible("pre-wedding-planning")) return false;
      if (phase === "recovery" && PLANNING_CARD_IDS.has(card.id)) return false;
      return true;
    })
    .map((card) => {
    if (card.id === "annita") return card;
    if (card.id === "photos" && !showGuestPic) {
      return {
        ...card,
        description: showBingo
          ? "Hashtag wall, booth downloads, and photobooth bingo — GuestPic uploads open in wedding week."
          : "Hashtag wall and booth downloads — GuestPic uploads open in wedding week.",
      };
    }
    return {
      ...card,
      action: () => setActiveTab(card.id as AppTab),
    };
    });

  const showChecklist = isFeatureVisible("weekend-checklist");
  const showGuestWall = isFeatureVisible("guest-wall");
  const showRsvpHero = isFeatureVisible("rsvp-hero");

  return (
    <div className="animate-fade-in animate-slide-up">
      {phase === "day" ? (
        <>
          <div className="wedding-screen-top relative px-6 pb-2">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="wedding-top-offset absolute right-6 text-[9px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[var(--wedding-text-dark)]"
              >
                Sign Out
              </button>
            )}
            <div className="wedding-top-offset absolute left-6">
              <HomeHeaderActions />
            </div>
          </div>
          <EventDayHero setActiveTab={setActiveTab} onOpenChat={onOpenChat} />
        </>
      ) : phase === "recovery" ? (
        <>
          <div className="wedding-screen-top relative px-6 pb-2">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="wedding-top-offset absolute right-6 text-[9px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[var(--wedding-text-dark)]"
              >
                Sign Out
              </button>
            )}
            <div className="wedding-top-offset absolute left-6">
              <HomeHeaderActions />
            </div>
          </div>
          <RecoveryHero setActiveTab={setActiveTab} />
        </>
      ) : (
        <>
          <div className="wedding-screen-top relative px-6 pb-4 text-center">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="wedding-top-offset absolute right-6 text-[9px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[var(--wedding-text-dark)]"
          >
            Sign Out
          </button>
        )}
        <div className="wedding-top-offset absolute left-6">
          <HomeHeaderActions />
        </div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Welcome, {userName}
        </p>
        <RainbowText as="h1" className="mb-2 font-serif text-5xl text-[var(--wedding-text-dark)]">
          J&J
        </RainbowText>
        <div className="mb-2 flex justify-center" style={{ color: theme.gold }}>
          <Heart size={16} fill="currentColor" />
        </div>
        <RainbowText
          as="h2"
          className="font-serif text-sm font-semibold uppercase tracking-[0.2em] text-[var(--wedding-gold)]"
        >
          Jarod & Jamie
        </RainbowText>
        <p className="font-script mt-2 text-2xl text-gray-500">26.09.26</p>
        <Countdown />
      </div>

      {phase === "week" && isFeatureVisible("wedding-week-banner") && (
        <div className="mb-6 px-6">
          <div
            className="rounded-2xl border bg-gradient-to-r from-[#fdf2f8] to-[#eff6ff] px-5 py-4 text-center"
            style={{ borderColor: theme.border }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500">Wedding week</p>
            <p className="mt-1 font-serif text-lg text-[var(--wedding-text-dark)]">Almost time for Montville!</p>
            <p className="mt-1 text-xs text-gray-500">Check your checklist, install the app, and get ready to celebrate.</p>
          </div>
        </div>
      )}

      {showRsvpHero && (
      <div
        role="button"
        tabIndex={0}
        className="group relative mb-8 cursor-pointer px-6"
        onClick={() => setActiveTab("rsvp")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setActiveTab("rsvp");
        }}
      >
        <div className="relative h-[420px] overflow-hidden rounded-[2rem] shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
          <HeroImage alt="Spicers Clovelly Estate Pavilion" />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent px-6 pb-8 text-center text-white">
            <div className="mb-3 inline-flex max-w-full flex-col items-stretch">
              <div className="pointer-events-auto mb-3" onClick={(event) => event.stopPropagation()}>
                <WeddingWeather variant="overlay" className="w-full" />
              </div>
              <h3 className="mb-1 font-serif text-2xl tracking-wide">Spicers Clovelly Estate</h3>
            </div>
            <p className="mb-6 flex items-center gap-1 text-xs uppercase tracking-widest text-white/80">
              <MapPin size={12} /> Montville, QLD
            </p>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-white/90 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[var(--wedding-text-dark)] shadow-lg backdrop-blur-md transition-transform active:scale-95"
            >
              RSVP Now <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      )}
        </>
      )}

      <div className="space-y-4 px-6 pb-10">
        {showChecklist && (
          <WeddingChecklist setActiveTab={setActiveTab} onOpenInstall={onOpenInstall} />
        )}

        <HomeWhereImStaying setActiveTab={setActiveTab} />

        {showVenueMap && (
          <button
            type="button"
            onClick={() => setActiveTab("venue-map")}
            className="flex w-full items-center justify-between gap-4 rounded-3xl border bg-gradient-to-r from-[#2a4a6b] to-[#5a8fb0] p-5 text-left shadow-lg"
            style={{ borderColor: theme.border }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#d4ebf7]">Venue map</p>
              <p className="mt-1 font-serif text-xl text-white">Spicers Clovelly Estate</p>
              <p className="mt-1 text-xs text-white/75">
                Homesteads, lawns, pool & the walk to Lake View Deck.
              </p>
            </div>
            <MapPinned size={28} className="shrink-0 text-[#d4ebf7]" />
          </button>
        )}

        {canVerifyBingo && (
          <button
            type="button"
            onClick={() => setActiveTab("mc-verify")}
            className="flex w-full items-center justify-between gap-4 rounded-3xl border bg-gradient-to-r from-[#2a2723] to-[#4a3d6b] p-5 text-left shadow-lg"
            style={{ borderColor: theme.border }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">MC tools</p>
              <p className="mt-1 font-serif text-xl text-white">Verify Bingo Winners</p>
              <p className="mt-1 text-xs text-white/75">
                Guests will bring their phone after completing Photobooth Bingo.
              </p>
            </div>
            <Crown size={28} className="shrink-0 text-[#c3a379]" />
          </button>
        )}

        {showGuestWall && (
          <section
            className="rounded-3xl border bg-white/80 p-5 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <p className="mb-3 text-center font-serif text-lg text-[var(--wedding-text-dark)]">Who&apos;s coming</p>
            <GuestPhotoWall compact />
            <button
              type="button"
              onClick={() => setActiveTab("party")}
              className="mt-4 w-full text-center text-[10px] font-bold uppercase tracking-widest text-[var(--wedding-gold)]"
            >
              View wedding party
            </button>
          </section>
        )}

        <div className="px-2 text-center">
          <RainbowText
            as="h2"
            className="mb-1 font-serif text-sm uppercase tracking-[0.15em] text-gray-500"
          >
            Explore
          </RainbowText>
          <RainbowText as="h3" className="font-serif text-2xl text-[var(--wedding-text-dark)]">
            Quick Links
          </RainbowText>
        </div>

        {homeCards.map((card) => (
          <GuideCard key={card.id} card={card} onSelect={card.action} />
        ))}
      </div>
    </div>
  );
}
