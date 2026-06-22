import { InterestForm } from "@/components/wedding/forms/interest-form";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import type { AppTab } from "@/types/wedding";

export function GlowUpScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Pre-Wedding Glow-Up" subtitle="Beauty Prep" onBack={() => setActiveTab("guide")} />
      <div className="mt-8 space-y-6 px-6">
        <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
          <strong className="font-bold text-[#2a2723]">Teeth Whitening:</strong> Brighten that smile
          until it&apos;s a hazard to oncoming traffic! 😬✨
          <br />
          <br />
          <strong className="font-bold text-[#2a2723]">Botox Pump Party:</strong> Freeze time and
          look absolutely snatched. We don&apos;t do stress wrinkles here, darlings! 💉💋
        </p>
        <InterestForm
          field="glowUpInterest"
          options={[
            { value: "teeth", label: "Teeth Whitening" },
            { value: "botox", label: "Botox Pump Party" },
            { value: "both", label: "Hit me with both!" },
          ]}
        />
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
