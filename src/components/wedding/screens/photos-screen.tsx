"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Hash, RefreshCw, Smartphone } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
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
      <SubHeader title="Photos" subtitle="Memories" onBack={() => setActiveTab("home")} />

      <div className="mt-8 space-y-6 px-6">
        <div className="rounded-3xl border bg-white/60 p-6 text-center shadow-sm" style={{ borderColor: theme.border }}>
          <div
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Hash size={14} />#{WEDDING_HASHTAG}
          </div>
          <p className="text-sm font-light leading-relaxed text-gray-600">
            Share your favourite moments on Instagram with our hashtag and watch the wall fill up
            throughout the weekend.
          </p>
          <a
            href={INSTAGRAM_TAG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#c3a379] hover:underline"
          >
            View on Instagram <ExternalLink size={12} />
          </a>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-[#2a2723]">Guest Photo Wall</h3>
            <button
              type="button"
              onClick={loadPhotos}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2a2723]"
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
                  : "Photos tagged #J-rodandJamo will appear here. Tap View on Instagram above to see what's been shared."}
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
                  className="group relative aspect-square overflow-hidden rounded-2xl border bg-[#f7f4ee] shadow-sm"
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

        <div className="rounded-3xl border bg-white/60 p-6 shadow-sm" style={{ borderColor: theme.border }}>
          <div className="mb-3 flex items-center gap-2">
            <Smartphone size={20} style={{ color: theme.gold }} />
            <h3 className="font-serif text-xl text-[#2a2723]">In The Booth App</h3>
          </div>
          <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
            Got your glamour shot from our quilted booth? Obviously you did — you&apos;re at a
            wedding. Download the free{" "}
            <strong className="font-medium text-[#2a2723]">In The Booth</strong> app, enter event
            code{" "}
            <strong className="font-mono text-[#c3a379]">{BOOTH_EVENT_CODE}</strong> (or the code on
            your print strip), and grab your photos, GIFs, and slow-mo straight to your camera roll.
            Ready for Instagram stardom? Obviously.
          </p>
          <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
            Feeling sneaky? Use <strong className="font-medium text-[#2a2723]">Guest Cam</strong> to
            snap fly-on-the-wall shots and send them to the booth for instant printing — no awkward
            posing required. Your candid masterpiece, printed and fridge-worthy.
          </p>
          <div
            className="mb-4 rounded-2xl border bg-[#f7f4ee] px-4 py-3 text-center"
            style={{ borderColor: theme.border }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Event Code
            </p>
            <p className="font-mono text-2xl font-bold tracking-wider text-[#2a2723]">
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
              className="flex w-full items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#2a2723]"
            >
              How the app works <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
