"use client";

import { useState } from "react";
import { AccommodationForm } from "@/components/wedding/forms/accommodation-form";
import { TransferShareForm } from "@/components/wedding/forms/transfer-share-form";
import { InterestForm } from "@/components/wedding/forms/interest-form";
import { useAnnitaFabPrefs } from "@/components/wedding/hooks/use-annita-fab-prefs";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { ProfilePhotoSection } from "@/components/wedding/profile/profile-photo-section";
import { RsvpProfileForm } from "@/components/wedding/profile/rsvp-profile-form";
import { PasskeySettings } from "@/components/wedding/auth/social-auth";
import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { ThemeToggle } from "@/components/wedding/shared/theme-toggle";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type ProfileScreenProps = {
  setActiveTab: (tab: AppTab) => void;
  onLogout?: () => void;
};

export function ProfileScreen({ setActiveTab, onLogout }: ProfileScreenProps) {
  const { profile, loading, error, setError, setProfile } = useGuestProfile();
  const { hidden: annitaHidden, showAnnita } = useAnnitaFabPrefs();
  const [passkeyMessage, setPasskeyMessage] = useState("");

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center wedding-screen-top">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-8 py-12 text-center wedding-screen-top">
        <p className="text-sm text-gray-500">Sign in to view your guest profile.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="My Profile" subtitle="Guest account" onBack={() => setActiveTab("home")} />

      <div className="mt-6 space-y-4 px-6">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <ProfilePhotoSection
          profile={profile}
          onProfileChange={setProfile}
          onError={setError}
        />

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-2xl border bg-white/60 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[var(--wedding-text-dark)]"
            style={{ borderColor: theme.border }}
          >
            Sign out
          </button>
        )}

        <ContentAccordion
          defaultOpenId="rsvp"
          items={[
            {
              id: "rsvp",
              title: "RSVP & celebration details",
              content: <RsvpProfileForm />,
            },
            {
              id: "accommodation",
              title: "Accommodation & shuttle",
              content: <AccommodationForm />,
            },
            {
              id: "transfer",
              title: "Flights & shared transfers",
              content: <TransferShareForm />,
            },
            {
              id: "interests",
              title: "Pre-wedding experiences",
              content: (
                <div className="space-y-6">
                  <InterestForm
                    field="glowUpInterest"
                    options={[
                      { value: "teeth", label: "Teeth Whitening" },
                      { value: "botox", label: "Botox Pump Party" },
                      { value: "both", label: "Hit me with both!" },
                    ]}
                  />
                  <InterestForm
                    field="onSiteServiceInterest"
                    options={[
                      { value: "hair", label: "Hair & Make-up" },
                      { value: "barber", label: "Barber / Fresh Cut" },
                      { value: "both", label: "Both Services" },
                    ]}
                  />
                </div>
              ),
            },
            {
              id: "preferences",
              title: "App preferences",
              content: (
                <div className="space-y-4">
                  {passkeyMessage && (
                    <p
                      className="rounded-xl border bg-white px-4 py-3 text-xs text-[var(--wedding-text-dark)]"
                      style={{ borderColor: theme.border }}
                    >
                      {passkeyMessage}
                    </p>
                  )}
                  <PasskeySettings embedded onMessage={setPasskeyMessage} />
                  <ThemeToggle />
                  {annitaHidden && (
                    <button
                      type="button"
                      onClick={showAnnita}
                      className="w-full rounded-2xl border bg-white px-4 py-3 text-left text-sm font-medium"
                      style={{ borderColor: theme.border, color: theme.textDark }}
                    >
                      Show Annita chat bubble
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
