"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Hash, RefreshCw, Smartphone, Sparkles } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";
import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import { GuideCard } from "@/components/wedding/shared/guide-card";
import { useWeddingPhase } from "@/components/wedding/hooks/use-wedding-phase";
import {
  BOOTH_EVENT_CODE,
  IN_THE_BOOTH,
  INSTAGRAM_TAG_URL,
  WEDDING_HASHTAG,
  type HashtagPhoto,
} from "@/lib/photos";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type PhotosScreenProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function PhotosScreen({ setActiveTab }: PhotosScreenProps) {
  const { isFeatureVisible } = useWeddingPhase();
  const showBingo = isFeatureVisible("photobooth-bingo");
  const [photos, setPhotos] = useState<HashtagPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  const loadPhotos = () => {
    setLoading(true);
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.photos ?? []);
        setConfigured(Boolean(data.configured));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Photos" subtitle="Memories & booth" onBack={() => setActiveTab("home")} />

      <div className="mt-6 space-y-4 px-6">
        {showBingo && (
        <GuideCard
          card={{
            id: "bingo",
            title: "Photobooth Bingo",
            description:
              "Tick off glam shots at the booth. Clear the card and Annita announces it to everyone.",
            actionLabel: "Play Bingo",
            icon: Sparkles,
            className:
              "bg-gradient-to-br from-[#c026d3] via-[#ec4899] to-[#f59e0b] text-white shadow-lg shadow-[#ec4899]/25",
            titleClassName: "text-white",
            descriptionClassName: "text-white/90",
            actionClassName: "text-white",
            iconClassName: "text-white",
          }}
          onSelect={() => setActiveTab("bingo")}
        />
        )}

        <ContentAccordion
          defaultOpenId="hashtag"
          items={[
            {
              id: "hashtag",
              title: `Share with #${WEDDING_HASHTAG}`,
              content: (
                <div className="text-center">
                  <div
                    className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest"
                    style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                  >
                    <Hash size={14} />#{WEDDING_HASHTAG}
                  </div>
                  <p className="text-sm font-light leading-relaxed text-gray-600">
                    Share your favourite moments on Instagram with our hashtag and watch the wall
                    fill up throughout the weekend.
                  </p>
                  <a
                    href={INSTAGRAM_TAG_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:underline"
                    style={{ color: theme.gold }}
                  >
                    View on Instagram <ExternalLink size={12} />
                  </a>
                </div>
              ),
            },
            {
              id: "booth-app",
              title: "In The Booth app & downloads",
              content: (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Smartphone size={18} style={{ color: theme.gold }} />
                    <p className="text-sm font-medium text-[var(--wedding-text-dark)]">Get your prints</p>
                  </div>
                  <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
                    Got your glamour shot from our quilted booth? Download the free{" "}
                    <strong className="font-medium text-[var(--wedding-text-dark)]">In The Booth</strong>{" "}
                    app, enter event code{" "}
                    <strong className="font-mono" style={{ color: theme.gold }}>
                      {BOOTH_EVENT_CODE}
                    </strong>
                    , and grab photos, GIFs, and slow-mo to your camera roll.
                  </p>
                  <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
                    Feeling sneaky? Use <strong className="font-medium text-[var(--wedding-text-dark)]">Guest Cam</strong>{" "}
                    to snap candid shots and send them to the booth for instant printing.
                  </p>
                  <div
                    className="mb-4 rounded-2xl border bg-[var(--wedding-bg)] px-4 py-3 text-center"
                    style={{ borderColor: theme.border }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Event Code
                    </p>
                    <p className="font-mono text-2xl font-bold tracking-wider text-[var(--wedding-text-dark)]">
                      {BOOTH_EVENT_CODE}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <a
                      href={IN_THE_BOOTH.iosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-md transition-transform active:scale-95"
                      style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                    >
                      Download for iPhone <ExternalLink size={14} />
                    </a>
                    <a
                      href={IN_THE_BOOTH.androidUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95"
                      style={{ borderColor: theme.border, color: theme.textDark }}
                    >
                      Download for Android <ExternalLink size={14} />
                    </a>
                    <a
                      href={IN_THE_BOOTH.infoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[var(--wedding-text-dark)]"
                    >
                      How the app works <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ),
            },
          ]}
        />

        <div>
          <div className="mb-4 flex items-center justify-between px-1">
            <RainbowText as="h3" className="font-serif text-xl text-[var(--wedding-text-dark)]">
              Guest Photo Wall
            </RainbowText>
            <button
              type="button"
              onClick={loadPhotos}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--wedding-text-dark)]"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading photos...</p>
          ) : photos.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed bg-white/40 p-8 text-center"
              style={{ borderColor: theme.border }}
            >
              <p className="text-sm font-light leading-relaxed text-gray-600">
                {configured
                  ? "No posts yet — be the first to tag #J-rodandJamo!"
                  : "Photos tagged #J-rodandJamo will appear here. Open the hashtag section above to view on Instagram."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <a
                  key={photo.id}
                  href={photo.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-2xl border bg-[var(--wedding-bg)] shadow-sm"
                  style={{ borderColor: theme.border }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.mediaUrl}
                    alt="Wedding guest photo"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {photo.mediaType === "VIDEO" && (
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      Video
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
