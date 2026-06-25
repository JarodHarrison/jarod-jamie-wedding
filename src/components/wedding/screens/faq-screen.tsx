import { Gift } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";
import { ChevronRight } from "lucide-react";

const faqItems = [
  {
    id: "children",
    title: "Are children invited to the reception?",
    content: (
      <p>
        We&apos;re excited to celebrate our special day with all of our loved ones! To ensure everyone
        can relax and enjoy the festivities, we kindly request that our reception be an adults-only
        affair. We appreciate your understanding and can&apos;t wait to share this joyous occasion with
        you!
      </p>
    ),
  },
  {
    id: "venue",
    title: "Are the wedding ceremony and the reception at the same venue?",
    content: <p>Yes, both the ceremony and reception will be held at the same venue.</p>,
  },
  {
    id: "surprises",
    title: "Will there be surprises?",
    content: <p>😏</p>,
  },
];

export function FAQScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="FAQs" subtitle="Need to know" onBack={() => setActiveTab("home")} />
      <div className="mt-8 px-6">
        <ContentAccordion
          defaultOpenId="children"
          multiple={false}
          items={faqItems.map((item) => ({
            id: item.id,
            title: item.title,
            content: <div className="text-sm font-light leading-relaxed text-gray-600">{item.content}</div>,
          }))}
        />
      </div>
    </div>
  );
}

export function WishingWellScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Wishing Well" subtitle="Gifts" onBack={() => setActiveTab("home")} />
      <div className="mt-10 px-8 text-center">
        <div
          className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[var(--wedding-border)]/30"
          style={{ color: theme.gold }}
        >
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
