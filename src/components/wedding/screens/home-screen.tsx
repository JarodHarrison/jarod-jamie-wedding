import { Camera, ChevronRight, Gift, Heart, Info, MapPin, MessageCircle, Plane } from "lucide-react";
import { useState } from "react";
import { theme } from "@/lib/theme";
import { Countdown } from "@/components/wedding/shared/countdown";
import { HeroImage } from "@/components/wedding/shared/hero-image";
import { MenuRow } from "@/components/wedding/shared/menu-row";
import { PasskeySettings } from "@/components/wedding/auth/social-auth";
import type { AppTab } from "@/types/wedding";

type HomeScreenProps = {
  setActiveTab: (tab: AppTab) => void;
  onLogout?: () => void;
  userName: string;
  onOpenChat?: () => void;
};

export function HomeScreen({ setActiveTab, onLogout, userName, onOpenChat }: HomeScreenProps) {
  const [passkeyMessage, setPasskeyMessage] = useState("");

  return (
    <div className="animate-fade-in animate-slide-up">
      <div className="wedding-screen-top relative px-6 pb-4 text-center">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="wedding-top-offset absolute right-6 text-[9px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[#2a2723]"
          >
            Sign Out
          </button>
        )}
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Welcome, {userName}
        </p>
        <h1 className="mb-2 font-serif text-5xl" style={{ color: theme.textDark }}>
          J<span className="text-3xl">&</span>J
        </h1>
        <div className="mb-2 flex justify-center" style={{ color: theme.gold }}>
          <Heart size={16} fill="currentColor" />
        </div>
        <h2
          className="font-serif text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: theme.gold }}
        >
          Jarod & Jamie
        </h2>
        <p className="font-script mt-2 text-2xl text-gray-500">26.09.26</p>
        <Countdown />
      </div>

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
            <h3 className="mb-1 font-serif text-2xl tracking-wide">Spicers Clovelly Estate</h3>
            <p className="mb-6 flex items-center gap-1 text-xs uppercase tracking-widest text-white/80">
              <MapPin size={12} /> Montville, QLD
            </p>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-white/90 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[#2a2723] shadow-lg backdrop-blur-md transition-transform active:scale-95"
            >
              RSVP Now <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-8 pb-10">
        <h3 className="mb-4 font-serif text-xl text-[#2a2723]">Quick Links</h3>
        {passkeyMessage && (
          <p className="rounded-xl border bg-white px-4 py-3 text-xs text-[#2a2723]" style={{ borderColor: theme.border }}>
            {passkeyMessage}
          </p>
        )}
        <PasskeySettings onMessage={setPasskeyMessage} />
        <MenuRow icon={Heart} title="Our Story" onClick={() => setActiveTab("story")} />
        <MenuRow icon={MessageCircle} title="Annita Help" onClick={() => onOpenChat?.()} />
        <MenuRow icon={Camera} title="Photos" onClick={() => setActiveTab("photos")} />
        <MenuRow icon={Gift} title="Wishing Well" onClick={() => setActiveTab("wishingwell")} />
        <MenuRow icon={Plane} title="Travel & Stay" onClick={() => setActiveTab("travel")} />
        <MenuRow icon={Info} title="FAQs" onClick={() => setActiveTab("faq")} />
      </div>
    </div>
  );
}
