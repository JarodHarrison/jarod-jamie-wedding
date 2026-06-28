"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { ImageLightbox } from "@/components/wedding/shared/image-lightbox";
import { StripeCheckoutHint } from "@/components/wedding/shared/stripe-checkout-hint";
import {
  getGoldCoastProduct,
  getGoldCoastStripeUrl,
  type GoldCoastStripeProductId,
} from "@/lib/gold-coast-stripe";
import { STRIPE_CHECKOUT_FOOTER } from "@/lib/stripe-checkout-hints";
import { theme } from "@/lib/theme";

type GoldCoastOfferCardProps = {
  productId: GoldCoastStripeProductId;
  badge?: string;
};

export function GoldCoastOfferCard({ productId, badge }: GoldCoastOfferCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const product = getGoldCoastProduct(productId);
  const stripeUrl = getGoldCoastStripeUrl(productId);

  return (
    <>
      <div
        className="overflow-hidden rounded-3xl border bg-white/80 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block w-full cursor-zoom-in"
          aria-label={`View ${product.title} full screen`}
        >
          <Image
            src={product.image}
            alt={product.title}
            width={1200}
            height={750}
            className="h-auto w-full"
          />
        </button>
        <div className="p-5 text-center">
        {badge && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            {badge}
          </p>
        )}
        <h3 className="font-serif text-xl text-[#2a2723]">{product.title}</h3>
        <p className="mt-1 text-sm text-[#c3a379]">{product.priceLabel}</p>
        {product.quantityHint && (
          <p className="mt-2 text-[11px] text-gray-500">{product.quantityHint}</p>
        )}
        {stripeUrl ? (
          <a
            href={stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-md transition-transform active:scale-[0.98]"
            style={{ backgroundColor: theme.gold, color: theme.btnDark }}
          >
            Pay with Stripe <ChevronRight size={14} />
          </a>
        ) : (
          <p
            className="mt-4 rounded-full border px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
            style={{ borderColor: theme.border }}
          >
            Payment link coming soon
          </p>
        )}
        {stripeUrl && <StripeCheckoutHint className="mt-3 px-1" />}
        <p className="mt-2 text-[10px] text-gray-400">{STRIPE_CHECKOUT_FOOTER}</p>
        </div>
      </div>

      <ImageLightbox
        open={lightboxOpen}
        src={product.image}
        alt={product.title}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
