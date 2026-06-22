import { ChevronRight, Gift } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

export function FAQScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="FAQs" subtitle="Need to know" onBack={() => setActiveTab("home")} />
      <div className="mt-8 space-y-4 px-6">
        <div className="rounded-2xl border bg-white/60 p-5 shadow-sm" style={{ borderColor: theme.border }}>
          <h4 className="mb-2 font-serif text-lg text-[#2a2723]">Are children invited to the reception?</h4>
          <p className="text-sm font-light leading-relaxed text-gray-600">
            We&apos;re excited to celebrate our special day with all of our loved ones! To ensure everyone can relax and enjoy the festivities, we kindly request that our reception be an adults-only affair. We appreciate your understanding and can&apos;t wait to share this joyous occasion with you!
          </p>
        </div>
        <div className="rounded-2xl border bg-white/60 p-5 shadow-sm" style={{ borderColor: theme.border }}>
          <h4 className="mb-2 font-serif text-lg text-[#2a2723]">Are the wedding ceremony and the reception at the same venue?</h4>
          <p className="text-sm font-light leading-relaxed text-gray-600">
            Yes, both the ceremony and reception will be held at the same venue.
          </p>
        </div>
        <div className="rounded-2xl border bg-white/60 p-5 shadow-sm" style={{ borderColor: theme.border }}>
          <h4 className="mb-2 font-serif text-lg text-[#2a2723]">Will there be surprises?</h4>
          <p className="text-sm font-light leading-relaxed text-gray-600">😏</p>
        </div>
      </div>
    </div>
  );
}

export function WishingWellScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Wishing Well" subtitle="Gifts" onBack={() => setActiveTab("home")} />
      <div className="mt-10 px-8 text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#e2d5c4]/30 text-[#c3a379]">
          <Gift size={40} />
        </div>
        <p className="mb-10 text-sm font-light leading-relaxed text-gray-600">
          Your presence is the greatest gift! If you wish to bless us, a contribution to our wishing
          well would be warmly appreciated.
        </p>
        <a
          href="https://www.pocketwell.com.au/events/jarod-and-jamie"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-widest shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          Contribute Securely <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}
