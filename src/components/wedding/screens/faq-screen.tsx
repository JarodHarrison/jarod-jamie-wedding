import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { StripeCheckoutHint } from "@/components/wedding/shared/stripe-checkout-hint";
import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import { getWishingWellStripeUrl, WISHING_WELL_IMAGE } from "@/lib/wishing-well";
import { STRIPE_CHECKOUT_FOOTER } from "@/lib/stripe-checkout-hints";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

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
  const stripeUrl = getWishingWellStripeUrl();

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Wishing Well" subtitle="Gifts" onBack={() => setActiveTab("home")} />
      <div className="mt-6 px-4">
        <div
          className="mb-6 overflow-hidden rounded-2xl border shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <Image
            src={WISHING_WELL_IMAGE}
            alt="Digital Wishing Well for Jarod and Jamie — honeymoon poem with Maldives, Dubai, and theme park photos"
            width={1200}
            height={750}
            className="h-auto w-full"
            priority
          />
        </div>

        <a
          href={stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-widest shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          Contribute via Stripe <ChevronRight size={14} />
        </a>
        <StripeCheckoutHint className="mt-3 text-center" />
        <p className="mt-2 text-center text-[10px] text-gray-400">{STRIPE_CHECKOUT_FOOTER}</p>
      </div>
    </div>
  );
}
