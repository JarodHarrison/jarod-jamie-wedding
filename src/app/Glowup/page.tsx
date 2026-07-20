import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BucksGlitterTrail } from "@/components/bucks-party/bucks-glitter-trail";
import { GlowUpInterestForm } from "@/components/glow-up-party/glow-up-interest-form";
import { GlowUpShareButton } from "@/components/glow-up-party/glow-up-share-button";
import {
  BOTOX_PUMP_PARTY_FLYER,
  GLOW_UP_BOTOX_PRICE_PER_UNIT,
  GLOW_UP_FILLER_PRICE_PER_ML,
  GLOW_UP_PARTY_PLACE_LABEL,
  GLOW_UP_PARTY_PLACE_NOTE,
  GLOW_UP_PARTY_RSVP_DEADLINE_LABEL,
  GLOW_UP_PARTY_TIME_LABEL,
  GLOW_UP_PARTY_WHEN_LABEL,
  GLOW_UP_WHITENING_KIT_PRICE,
  GLOW_UP_WHITENING_PRICE,
  TEETH_WHITENING_FLYER,
} from "@/lib/glow-up-party";
import "./glow-up-party.css";

export const metadata: Metadata = {
  title: "Pre-Wedding Glow-Up: Jarod & Jamie",
  description: `Join Jarod & Jamie for a luxe pre-wedding glow-up on ${GLOW_UP_PARTY_WHEN_LABEL}. RSVP by ${GLOW_UP_PARTY_RSVP_DEADLINE_LABEL}.`,
  openGraph: {
    title: "Jarod & Jamie: Pre-Wedding Glow-Up",
    description: `${GLOW_UP_PARTY_WHEN_LABEL}. Snatch. Glow. Celebrate love. RSVP by ${GLOW_UP_PARTY_RSVP_DEADLINE_LABEL}.`,
  },
};

const FLOAT_EMOJIS = [
  "✨",
  "💛",
  "💅",
  "💉",
  "🦷",
  "💋",
  "🪞",
  "🥂",
  "💍",
  "🌈",
  "👑",
  "🥳",
  "💃",
  "🕺",
  "👠",
  "🍾",
  "😎",
  "🫠",
  "🙈",
  "🎈",
  "🎉",
  "🎊",
  "🏳️‍🌈",
  "💖",
  "🌟",
  "💫",
  "🪙",
];

export default function GlowUpPartyPage() {
  return (
    <div className="glowup-page relative">
      <div className="glowup-aurora" aria-hidden />
      <div className="glowup-float-emojis" aria-hidden>
        {FLOAT_EMOJIS.map((emoji, i) => (
          <span key={`${emoji}-${i}`}>{emoji}</span>
        ))}
      </div>
      <BucksGlitterTrail sizeScale={1.5} includeGold className="glowup-glitter-canvas" />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] sm:max-w-2xl sm:px-6 lg:max-w-3xl">
        <div className="glowup-rainbow-bar mb-6 rounded-full" />

        <header className="relative mb-10 text-center sm:mb-12">
          <p className="glowup-brand relative font-script text-3xl sm:text-4xl">
            Jarod &amp; Jamie
          </p>
          <h1 className="glowup-heading relative mt-2 font-serif text-4xl tracking-tight sm:text-5xl md:text-6xl">
            Pre-Wedding Glow-Up
          </h1>
          <p className="glowup-muted relative mt-4 font-serif text-lg sm:text-xl">
            {GLOW_UP_PARTY_WHEN_LABEL}
          </p>

          <div className="glowup-muted relative mx-auto mt-8 max-w-lg space-y-5 text-center text-sm leading-relaxed sm:text-base">
            <div className="glowup-heading space-y-1 text-base font-semibold uppercase tracking-wide sm:text-lg">
              <p>✨ Brace yourselves ✨</p>
              <p>✨ The ultimate glow-up is happening ✨</p>
            </div>
            <div className="space-y-3">
              <p>Listen up, queens, legends, and freshly hydrated faces.</p>
              <p>
                Before we walk down the aisle, it is time to get snatched, gleaming, and
                celebration-ready: teeth, tox, filler, the lot. 💅💉
              </p>
            </div>
            <div className="space-y-3">
              <p>
                Our favourite nurse from{" "}
                <strong className="glowup-heading">Face and Body Inc in East Perth</strong> is
                branching out on her own and has kindly allowed us to host a pump party at ours.
              </p>
              <p className="glowup-heading font-serif text-base sm:text-lg">
                If you want to know how good her work is… just look at Jamie&apos;s face. Need we say
                more? 😜
              </p>
            </div>
            <div>
              <p className="glowup-label mb-2 font-semibold">What to expect:</p>
              <ul className="mx-auto inline-block list-none space-y-1.5 text-center">
                <li>Signature smiles and optional Glow Kits.</li>
                <li>Botox + filler with our favourite nurse.</li>
                <li>Unmatched vibes and immaculate before-and-afters.</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p>📍 {GLOW_UP_PARTY_PLACE_LABEL}</p>
              <p>⏰ {GLOW_UP_PARTY_TIME_LABEL}</p>
              <p className="opacity-80">({GLOW_UP_PARTY_PLACE_NOTE})</p>
              <p className="glowup-label pt-1 font-semibold">
                RSVP by {GLOW_UP_PARTY_RSVP_DEADLINE_LABEL}
              </p>
            </div>
            <div className="glowup-heading space-y-1 font-serif text-lg sm:text-xl">
              <p>Book yourself in, gorgeous.</p>
              <p>We&apos;re getting married. 💍✨</p>
            </div>
          </div>

          <div className="relative mt-8 flex flex-col items-center gap-3">
            <GlowUpShareButton />
          </div>
        </header>

        <div className="mb-10 space-y-6">
          <article className="glowup-card glowup-offer">
            <Image
              src={TEETH_WHITENING_FLYER}
              alt="J&J Teeth-Whitening Party"
              width={1200}
              height={750}
              className="h-auto w-full"
              priority
            />
            <div className="p-5">
              <p className="glowup-label text-[10px] font-bold uppercase tracking-widest">
                Teeth-Whitening Party
              </p>
              <h2 className="glowup-heading mt-1 font-serif text-xl">
                Signature Smile · ${GLOW_UP_WHITENING_PRICE}
              </h2>
              <p className="glowup-muted mt-3 text-sm leading-relaxed">
                Professional in-chair whitening with dental-grade gel for ${GLOW_UP_WHITENING_PRICE}.
                Want enhanced, longer-lasting results? There is an additional whitening kit for $
                {GLOW_UP_WHITENING_KIT_PRICE} available on the day.
              </p>
            </div>
          </article>

          <article className="glowup-card glowup-offer">
            <Image
              src={BOTOX_PUMP_PARTY_FLYER}
              alt="J&J Botox Pump Party"
              width={1200}
              height={750}
              className="h-auto w-full"
            />
            <div className="p-5">
              <p className="glowup-label text-[10px] font-bold uppercase tracking-widest">
                Botox Pump Party
              </p>
              <h2 className="glowup-heading mt-1 font-serif text-xl">
                Snatch. Glow. Celebrate love.
              </h2>
              <p className="glowup-muted mt-3 text-sm leading-relaxed">
                Botox at{" "}
                <strong className="glowup-heading">
                  ${GLOW_UP_BOTOX_PRICE_PER_UNIT} per unit
                </strong>{" "}
                and filler at{" "}
                <strong className="glowup-heading">${GLOW_UP_FILLER_PRICE_PER_ML} per ml</strong>.
                Teeth whitening is available on the day too.
              </p>
            </div>
          </article>
        </div>

        <GlowUpInterestForm />

        <p className="glowup-muted mt-10 text-center text-xs opacity-70">
          Already on the wedding app?{" "}
          <Link href="/" className="glowup-label underline-offset-2 hover:underline">
            Open jarodandjamiewedding.com
          </Link>
        </p>
      </div>
    </div>
  );
}
