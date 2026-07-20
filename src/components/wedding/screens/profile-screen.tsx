"use client";

import { useState } from "react";
import { AccommodationForm } from "@/components/wedding/forms/accommodation-form";
import { TransferShareForm } from "@/components/wedding/forms/transfer-share-form";
import { GiftColourForm } from "@/components/wedding/forms/gift-colour-form";
import { GoldCoastTicketsSection } from "@/components/wedding/profile/gold-coast-tickets-section";
import { InterestForm } from "@/components/wedding/forms/interest-form";
import { GLOW_UP_PARTY_PUBLIC_PATH } from "@/lib/glow-up-party";
import { ExternalLink } from "lucide-react";
import { useAnnitaFabPrefs } from "@/components/wedding/hooks/use-annita-fab-prefs";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { PartyBioForm } from "@/components/wedding/profile/party-bio-form";
import { ProfilePhotoSection } from "@/components/wedding/profile/profile-photo-section";
import { CompanionSection } from "@/components/wedding/profile/companion-section";
import { MyPartySection } from "@/components/wedding/profile/my-party-section";
import { RsvpProfileForm } from "@/components/wedding/profile/rsvp-profile-form";
import { PasskeySettings, GoogleLinkSettings } from "@/components/wedding/auth/social-auth";
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
  const { profile, loading, error, setError, setProfile, visionModerationEnabled } = useGuestProfile();
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
    <div className="animate-fade-in animate-slide-right pb-24">
      <SubHeader title="My Profile" subtitle="Guest account" onBack={() => setActiveTab("home")} />

      <div className="mt-6 flex min-h-[calc(100vh-12rem)] flex-col px-6">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <ProfilePhotoSection
            profile={profile}
            onProfileChange={setProfile}
            onError={setError}
            visionModerationEnabled={visionModerationEnabled}
          />

          <CompanionSection
            profile={profile}
            onProfileChange={setProfile}
            onError={setError}
            visionModerationEnabled={visionModerationEnabled}
          />

          <ContentAccordion
            defaultOpenId="rsvp"
            items={[
              {
                id: "my-party",
                title: "My party",
                content: <MyPartySection onError={setError} />,
              },
              {
                id: "rsvp",
                title: "RSVP & celebration details",
                content: <RsvpProfileForm />,
              },
              ...(profile.isMc || profile.isCelebrant
                ? [
                    {
                      id: "party-bio",
                      title: profile.isCelebrant
                        ? "Celebrant & MC details"
                        : "MC details",
                      content: (
                        <PartyBioForm
                          profile={profile}
                          onProfileChange={setProfile}
                          onError={setError}
                        />
                      ),
                    },
                  ]
                : []),
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
                    <a
                      href={GLOW_UP_PARTY_PUBLIC_PATH}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm"
                      style={{ borderColor: theme.border }}
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                          Pre-Wedding Glow-Up
                        </p>
                        <p className="text-sm text-[#2a2723]">
                          Teeth whitening &amp; Botox Pump Party: RSVP on the Glow-Up page
                        </p>
                      </div>
                      <ExternalLink size={14} className="shrink-0 text-gray-400" />
                    </a>
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
                id: "gift-colours",
                title: "Gift colour preference",
                content: <GiftColourForm />,
              },
              ...(profile.tier === "PENTHOUSE"
                ? [
                    {
                      id: "gold-coast-tickets",
                      title: "Gold Coast tickets",
                      content: <GoldCoastTicketsSection />,
                    },
                  ]
                : []),
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
                    <GoogleLinkSettings embedded onMessage={setPasskeyMessage} />
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

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="mt-auto w-full rounded-2xl border bg-white/60 px-4 py-3 pt-8 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[var(--wedding-text-dark)]"
            style={{ borderColor: theme.border }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
