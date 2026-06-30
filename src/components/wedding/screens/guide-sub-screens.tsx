import { ExternalLink } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { InterestForm } from "@/components/wedding/forms/interest-form";
import { ReturnShuttleRegistrationForm } from "@/components/wedding/forms/return-shuttle-registration";
import { RETURN_SHUTTLE } from "@/lib/return-shuttle";
import { fashionInspirationLinks } from "@/components/wedding/data/fashion-inspiration";
import { ImageLightbox } from "@/components/wedding/shared/image-lightbox";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

const TEETH_WHITENING_FLYER = "/glow-up/teeth-whitening-party.png";
const BOTOX_PUMP_PARTY_FLYER = "/glow-up/botox-pump-party.png";

type GlowUpFlyer = "teeth" | "botox";

export function FashionInspirationScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Fashion Inspiration" subtitle="Dress to Impress" onBack={() => setActiveTab("guide")} />
      <div className="mt-8 space-y-6 px-6">
        <div
          className="rounded-2xl border bg-white p-5 text-sm leading-relaxed text-gray-600 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <p className="mb-3 font-serif text-lg text-[#2a2723]">The dress code</p>
          <ul className="space-y-2 text-sm">
            <li>
              <strong className="text-[#2a2723]">Ceremony (Sat):</strong> Colourful cocktail attire
            </li>
            <li>
              <strong className="text-[#2a2723]">Meet &amp; Greet (Fri):</strong> Smart casual
            </li>
            <li>
              <strong className="text-[#2a2723]">Family Breakfast (Sun):</strong> Casual
            </li>
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            Think colour, personality, and a little glamour — you&apos;re on a mountaintop, honey.
          </p>
        </div>

        {fashionInspirationLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
            style={{ borderColor: theme.border }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">{link.subtitle}</p>
            <h3 className="mb-2 font-serif text-xl text-[#2a2723]">{link.title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-600">{link.description}</p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#2a2723] transition-colors group-hover:text-[#c3a379]">
              {link.cta}
              <ExternalLink size={12} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function GlowUpScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  const [flyerOpen, setFlyerOpen] = useState<GlowUpFlyer | null>(null);

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Pre-Wedding Glow-Up" subtitle="Beauty Prep" onBack={() => setActiveTab("guide")} />
      <div className="mt-8 space-y-6 px-6">
        <div
          className="overflow-hidden rounded-3xl border bg-white/80 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <button
            type="button"
            onClick={() => setFlyerOpen("teeth")}
            className="block w-full cursor-zoom-in"
            aria-label="View Teeth-Whitening Party flyer full screen"
          >
            <Image
              src={TEETH_WHITENING_FLYER}
              alt="J&J Teeth-Whitening Party — $250 each with optional Glow Kit add-on"
              width={1200}
              height={750}
              className="h-auto w-full"
            />
          </button>
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">Teeth-Whitening Party</p>
            <h3 className="mt-1 font-serif text-xl text-[#2a2723]">Signature Smile · $250 each</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Professional in-chair whitening with dental-grade gel before the big day. Optional at-home Glow Kit
              add-on (+$50) to enhance and stabilise your results.
            </p>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-3xl border bg-white/80 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <button
            type="button"
            onClick={() => setFlyerOpen("botox")}
            className="block w-full cursor-zoom-in"
            aria-label="View Botox Pump Party flyer full screen"
          >
            <Image
              src={BOTOX_PUMP_PARTY_FLYER}
              alt="J&J Botox Pump Party — tox from $3.75 per unit, filler $375 per ml, plus teeth whitening on the day"
              width={1200}
              height={750}
              className="h-auto w-full"
            />
          </button>
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">Botox Pump Party</p>
            <h3 className="mt-1 font-serif text-xl text-[#2a2723]">Snatch. Glow. Celebrate love.</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Join us for a luxe pre-wedding beauty party — tox from <strong className="text-[#2a2723]">$3.75 per unit</strong>,
              filler <strong className="text-[#2a2723]">$375 per ml</strong>, with our teeth-whitening clinic running
              on the day too. Come get snatched, glowing, and celebration-ready before the big day.
            </p>
          </div>
        </div>

        <InterestForm
          field="glowUpInterest"
          options={[
            { value: "teeth", label: "Teeth Whitening" },
            { value: "botox", label: "Botox Pump Party" },
            { value: "both", label: "Hit me with both!" },
          ]}
        />
      </div>

      <ImageLightbox
        open={flyerOpen === "teeth"}
        src={TEETH_WHITENING_FLYER}
        alt="J&J Teeth-Whitening Party flyer"
        onClose={() => setFlyerOpen(null)}
      />
      <ImageLightbox
        open={flyerOpen === "botox"}
        src={BOTOX_PUMP_PARTY_FLYER}
        alt="J&J Botox Pump Party flyer"
        onClose={() => setFlyerOpen(null)}
      />
    </div>
  );
}

export function DepartureTransportScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Departure Transport" subtitle="Airport Express" onBack={() => setActiveTab("guide")} />
      <div className="mt-8 space-y-6 px-6">
        <p className="text-sm font-light leading-relaxed text-gray-600">
          Heading home on {RETURN_SHUTTLE.displayDate}? Register for the departure coach from Spicers
          Clovelly Estate to Brisbane (BNE) or Sunshine Coast (MCY) airports. We&apos;ll confirm
          bookings and pricing once we have enough interest.
        </p>
        <ReturnShuttleRegistrationForm />
      </div>
    </div>
  );
}

export function OnSiteScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="On-Site Services" subtitle="Looking Sharp" onBack={() => setActiveTab("guide")} />
      <div className="mt-8 space-y-6 px-6">
        <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
          We&apos;re looking into bringing a professional hair & make-up artist and a barber on-site
          for the morning of the wedding so everyone can look their best!
        </p>
        <InterestForm
          field="onSiteServiceInterest"
          options={[
            { value: "hair", label: "Hair & Make-up" },
            { value: "barber", label: "Barber / Fresh Cut" },
            { value: "both", label: "Both Services" },
          ]}
        />
      </div>
    </div>
  );
}
