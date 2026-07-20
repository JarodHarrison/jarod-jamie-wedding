import type { Metadata } from "next";
import Link from "next/link";
import { BucksGlitterTrail } from "@/components/bucks-party/bucks-glitter-trail";
import { BucksLiveEventDetails, BucksLivePunchline } from "@/components/bucks-party/bucks-live-event-details";
import { BucksPartyRsvpForm } from "@/components/bucks-party/bucks-party-rsvp-form";
import { BucksShareButton } from "@/components/bucks-party/bucks-share-button";
import { getBucksPartyConfig } from "@/lib/bucks-party-config-server";
import { getBucksPartyStripeUrl } from "@/lib/bucks-party-stripe";
import "./bucks-party.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const event = await getBucksPartyConfig();
  return {
    title: "Bucks Party RSVP: Jarod & Jamie",
    description: `The ultimate joint bucks: ${event.dateLabel}. Double the grooms, double the mayhem. RSVP now.`,
    openGraph: {
      title: "Jarod & Jamie: The Ultimate Joint Bucks",
      description: `Brace yourselves · ${event.dateLabel}. ${event.placeLabel} · ${event.timeLabel}. Get in, losers. We're getting married.`,
    },
  };
}

export default async function BucksPartyPage() {
  const stripeUrl = getBucksPartyStripeUrl();
  const event = await getBucksPartyConfig();

  return (
    <div className="bucks-page relative">
      <div className="bucks-aurora" aria-hidden />
      <div className="bucks-float-hearts" aria-hidden>
        {[
          "🌈",
          "🥂",
          "❤️",
          "💍",
          "🤪",
          "🏳️‍🌈",
          "🎶",
          "🎵",
          "😎",
          "😶‍🌫️",
          "🤐",
          "🫠",
          "🥳",
          "🙈",
          "🙉",
          "🙊",
          "💃",
          "🕺",
          "🎈",
          "🎉",
          "🎊",
          "👑",
          "👠",
          "🍾",
          "🍸",
          "🍹",
          "🥂",
        ].map((emoji, i) => (
          <span key={`${emoji}-${i}`}>{emoji}</span>
        ))}
      </div>
      <BucksGlitterTrail />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] sm:max-w-2xl sm:px-6 lg:max-w-3xl">
        <div className="bucks-rainbow-bar mb-6 rounded-full" />

        <header className="relative mb-10 text-center sm:mb-12">
          <p className="relative font-script text-3xl text-pink-300 sm:text-4xl">Jarod &amp; Jamie</p>
          <h1 className="relative mt-2 font-serif text-4xl tracking-tight text-white sm:text-5xl md:text-6xl">
            Bucks Party
          </h1>

          <div className="relative mx-auto mt-8 max-w-lg space-y-5 text-center text-sm leading-relaxed text-white/80 sm:text-base">
            <BucksLiveEventDetails initial={event} />

            <div className="space-y-1 text-base font-semibold uppercase tracking-wide text-white sm:text-lg">
              <p>🚨 Brace yourselves 🚨</p>
              <p>🚨 The ultimate joint bucks is happening 🚨</p>
            </div>
            <div className="space-y-3">
              <p>Listen up, queens, legends, and accomplices.</p>
              <p>
                We are tying the knot, but before we walk down the aisle, it is time to completely
                untether from reality.
              </p>
            </div>
            <div className="space-y-3">
              <p>Consider this your official warning:</p>
              <p>
                J-rod and Jamo are having a joint bucks party, and it is going to be double the
                grooms, double the unadulterated mayhem, and unapologetically gay AF. 💅✨
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold text-pink-300">What to expect:</p>
              <ul className="mx-auto inline-block list-none space-y-1.5 text-center">
                <li>Unmatched chaos and immaculate vibes.</li>
                <li>Questionable decisions we will collectively deny on Sunday morning.</li>
                <li>A mandatory recovery period of 3–5 business days.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p>
                We need headcounts <span className="font-semibold text-white">NOW</span>.
              </p>
              <p>
                RSVP immediately so we can lock in the chaos, secure the glitter, and start
                preparing your survival kits.
              </p>
            </div>
            <BucksLivePunchline initial={event} />
          </div>

          <div className="relative mt-8 flex flex-col items-center gap-3">
            <BucksShareButton />
            {stripeUrl ? (
              <div className="space-y-2">
                <a
                  href={stripeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bucks-cta inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
                >
                  Prepay your place
                </a>
                <p className="text-center text-[11px] text-white/70">
                  Price shown includes the processing fee.
                </p>
              </div>
            ) : null}
          </div>
        </header>

        <BucksPartyRsvpForm stripeUrl={stripeUrl} />

        <p className="mt-10 text-center text-xs text-white/45">
          Already on the wedding app?{" "}
          <Link href="/" className="text-pink-300 underline-offset-2 hover:underline">
            Open jarodandjamiewedding.com
          </Link>
        </p>
      </div>
    </div>
  );
}
