import { ExternalLink } from "lucide-react";
import { InterestForm } from "@/components/wedding/forms/interest-form";
import { ReturnShuttleRegistrationForm } from "@/components/wedding/forms/return-shuttle-registration";
import { RETURN_SHUTTLE } from "@/lib/return-shuttle";
import { fashionInspirationLinks } from "@/components/wedding/data/fashion-inspiration";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { theme } from "@/lib/theme";
import {
  GLOW_UP_PARTY_PLACE_LABEL,
  GLOW_UP_PARTY_PUBLIC_PATH,
  GLOW_UP_PARTY_RSVP_DEADLINE_LABEL,
  GLOW_UP_PARTY_WHEN_LABEL,
} from "@/lib/glow-up-party";
import type { AppTab } from "@/types/wedding";

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
            Think colour, personality, and a little glamour. You&apos;re on a mountaintop, honey.
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
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Pre-Wedding Glow-Up" subtitle="Beauty Prep" onBack={() => setActiveTab("guide")} />
      <div className="mt-8 space-y-6 px-6">
        <div
          className="rounded-2xl border bg-white p-5 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            {GLOW_UP_PARTY_WHEN_LABEL}
          </p>
          <h3 className="mt-1 font-serif text-xl text-[#2a2723]">Teeth whitening &amp; Botox Pump Party</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {GLOW_UP_PARTY_PLACE_LABEL}. RSVP by {GLOW_UP_PARTY_RSVP_DEADLINE_LABEL} on the Glow-Up page. Snatch,
            glow, and celebrate love before the big day.
          </p>
          <a
            href={GLOW_UP_PARTY_PUBLIC_PATH}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2a2723] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#e0c9a0]"
          >
            Open Glow-Up page
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
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
