import { Bus, Camera, ChevronRight, Map, Shirt, Sparkles } from "lucide-react";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

export function GuideScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-up pb-10">
      <div className="wedding-screen-top px-8 pb-6 text-center">
        <h2 className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500">Concierge</h2>
        <h1 className="font-serif text-3xl text-[#2a2723]">Planning Guide</h1>
      </div>

      <div className="mb-8 space-y-4 px-6">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("attractions")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setActiveTab("attractions");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-[#2a2723] p-6 text-white shadow-lg transition-transform active:scale-95"
        >
          <div className="absolute right-0 top-0 p-4 opacity-20 transition-transform group-hover:scale-110">
            <Map size={64} />
          </div>
          <h3 className="mb-1 font-serif text-2xl text-[#c3a379]">Explore Montville</h3>
          <p className="mb-4 max-w-[80%] text-sm text-gray-300">
            Discover amazing local attractions, waterfalls, and oddities.
          </p>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
            View Guide <ChevronRight size={12} />
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("fashion")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setActiveTab("fashion");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-6 shadow-md transition-transform active:scale-95"
          style={{ borderColor: theme.border }}
        >
          <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
            <Shirt size={64} color={theme.textDark} />
          </div>
          <h3 className="mb-1 font-serif text-2xl text-[#2a2723]">Fashion Inspiration</h3>
          <p className="mb-4 max-w-[80%] text-sm text-gray-500">
            Colourful cocktail looks, ASOS picks, and sequin tux energy for the big weekend.
          </p>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            Get Inspired <ChevronRight size={12} />
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("glowup")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setActiveTab("glowup");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-[#c3a379] p-6 text-white shadow-lg transition-transform active:scale-95"
        >
          <div className="absolute right-0 top-0 p-4 opacity-20 transition-transform group-hover:scale-110">
            <Sparkles size={64} />
          </div>
          <h3 className="mb-1 font-serif text-2xl text-[#2a2723]">Pre-Wedding Glow-Up</h3>
          <p className="mb-4 max-w-[80%] text-sm text-white/90">
            Teeth whitening & Botox Pump Party. Let&apos;s get snatched!
          </p>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2a2723]">
            Register <ChevronRight size={12} />
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("onsite")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setActiveTab("onsite");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-6 shadow-md transition-transform active:scale-95"
          style={{ borderColor: theme.border }}
        >
          <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
            <Camera size={64} color={theme.textDark} />
          </div>
          <h3 className="mb-1 font-serif text-2xl text-[#2a2723]">On-Site Services</h3>
          <p className="mb-4 max-w-[80%] text-sm text-gray-500">
            Professional Hair, Make-up, and Barber services for the big day.
          </p>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            Register <ChevronRight size={12} />
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("shuttle")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setActiveTab("shuttle");
          }}
          className="group relative cursor-pointer overflow-hidden rounded-3xl border bg-white p-6 shadow-md transition-transform active:scale-95"
          style={{ borderColor: theme.border }}
        >
          <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
            <Bus size={64} color={theme.textDark} />
          </div>
          <h3 className="mb-1 font-serif text-2xl text-[#2a2723]">Live Wedding Shuttle</h3>
          <p className="mb-4 max-w-[80%] text-sm text-gray-500">
            Track the courtesy bus in real time — next stop, ETA, and route to Spicers Clovelly Estate.
          </p>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            View Live Map <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}
