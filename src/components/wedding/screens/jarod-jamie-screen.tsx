"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, PenLine, Sparkles, Flag } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import {
  GUEST_STORY_MAX_LENGTH,
  GUEST_STORY_MIN_LENGTH,
  GUEST_STORY_MOODS,
  guestStoryMoodLabel,
  type GuestStoryItem,
} from "@/lib/guest-stories";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

const FLASH_INTERVAL_MS = 6000;

function StoryFlashWall({
  stories,
  onReport,
}: {
  stories: GuestStoryItem[];
  onReport: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
  }, [stories.length]);

  useEffect(() => {
    if (stories.length <= 1) return;

    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % stories.length);
        setVisible(true);
      }, 320);
    }, FLASH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [stories.length]);

  if (stories.length === 0) {
    return (
      <div
        className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white/50 p-8 text-center"
        style={{ borderColor: theme.border }}
      >
        <Sparkles size={28} className="mb-3 text-pink-400" />
        <p className="font-serif text-lg text-[var(--wedding-text-dark)]">The story wall is waiting</p>
        <p className="mt-2 text-sm text-gray-500">Be the first to share something funny or heartfelt.</p>
      </div>
    );
  }

  const story = stories[index];
  const mood = GUEST_STORY_MOODS.find((item) => item.value === story.mood);

  return (
    <div
      className="relative min-h-[240px] overflow-hidden rounded-3xl p-6 shadow-lg"
      style={{
        background: "linear-gradient(135deg, #fdf2f8 0%, #faf5ff 45%, #eff6ff 100%)",
        borderColor: theme.border,
      }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-pink-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-violet-200/40 blur-2xl" />

      <div
        className={`relative flex min-h-[190px] flex-col justify-between transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500">
            {mood ? `${mood.emoji} ${mood.label}` : guestStoryMoodLabel(story.mood)}
          </p>
          <p className="font-serif text-xl leading-relaxed text-[var(--wedding-text-dark)]">
            &ldquo;{story.content}&rdquo;
          </p>
        </div>
        <p className="mt-6 text-sm font-medium text-gray-500">
          — {story.displayName ?? "Anonymous guest"}
        </p>
        {!story.isMine && (
          <button
            type="button"
            onClick={() => onReport(story.id)}
            className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 transition-colors hover:text-red-500"
          >
            <Flag size={10} /> Report
          </button>
        )}
      </div>

      {stories.length > 1 && (
        <div className="relative mt-4 flex justify-center gap-1.5">
          {stories.map((item, dotIndex) => (
            <span
              key={item.id}
              className={`h-1.5 rounded-full transition-all ${
                dotIndex === index ? "w-5 bg-pink-400" : "w-1.5 bg-pink-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function JarodJamieScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  const [stories, setStories] = useState<GuestStoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const loadStories = useCallback(async () => {
    try {
      const res = await fetch("/api/guest-stories");
      if (!res.ok) return;
      const data = await res.json();
      setStories(data.stories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStories();
    const interval = window.setInterval(() => void loadStories(), 45_000);
    return () => window.clearInterval(interval);
  }, [loadStories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/guest-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mood, isAnonymous }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to share story.");
        return;
      }

      setStories((current) => [data.story, ...current.filter((item) => item.id !== data.story.id)]);
      setContent("");
      setMood("");
      setIsAnonymous(false);
      setSaved(true);
    } catch {
      setError("Failed to share story.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (storyId: string) => {
    setReportMessage("");
    try {
      const res = await fetch(`/api/guest-stories/${storyId}/report`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setReportMessage(data.error ?? "Could not report story.");
        return;
      }
      setStories((current) => current.filter((item) => item.id !== storyId));
      setReportMessage("Thanks — we'll review that story.");
    } catch {
      setReportMessage("Could not report story.");
    }
  };

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Jarod & Jamie" subtitle="Guest stories" onBack={() => setActiveTab("home")} />

      <div className="mt-6 space-y-6 px-6">
        <p className="text-center text-sm font-light leading-relaxed text-gray-600">
          Their love story keeps growing — and you&apos;re part of it. Share something funny, heartfelt,
          or gloriously chaotic. Stories flash up here for everyone, with your name or anonymously.
        </p>

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">Loading stories…</p>
        ) : (
          <StoryFlashWall stories={stories} onReport={(id) => void handleReport(id)} />
        )}
        {reportMessage && (
          <p className="text-center text-xs text-gray-500">{reportMessage}</p>
        )}

        <ContentAccordion
          defaultOpenId="share"
          items={[
            {
              id: "share",
              title: "Share your story",
              content: (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  {saved && (
                    <p className="text-xs text-emerald-600">Story shared — it&apos;s on the wall!</p>
                  )}

                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-600">Pick a vibe</p>
                    <div className="grid grid-cols-2 gap-2">
                      {GUEST_STORY_MOODS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMood(option.value)}
                          className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                            mood === option.value ? "text-white" : "bg-white text-[var(--wedding-text-dark)]"
                          }`}
                          style={{
                            borderColor: theme.border,
                            backgroundColor: mood === option.value ? theme.btnDark : undefined,
                            color: mood === option.value ? theme.gold : undefined,
                          }}
                        >
                          {option.emoji} {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block text-xs font-medium text-gray-600">
                    Your story
                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      rows={5}
                      maxLength={GUEST_STORY_MAX_LENGTH}
                      placeholder="That time Jarod… / Jamie once… / I'll never forget when…"
                      className="mt-1 w-full rounded-xl border bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-pink-300"
                      style={{ borderColor: theme.border }}
                    />
                    <span className="mt-1 block text-right text-[10px] text-gray-400">
                      {content.length}/{GUEST_STORY_MAX_LENGTH} (min {GUEST_STORY_MIN_LENGTH})
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(event) => setIsAnonymous(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-[var(--wedding-text-dark)]">Post anonymously</span>
                  </label>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !mood ||
                      content.trim().length < GUEST_STORY_MIN_LENGTH
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
                    style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                  >
                    <PenLine size={14} />
                    {submitting ? "Sharing…" : "Share on the wall"}
                  </button>
                </form>
              ),
            },
            {
              id: "intro",
              title: "How they met (the short version)",
              content: (
                <div className="space-y-4 text-sm font-light leading-relaxed text-gray-600">
                  <p>
                    Jarod and Jamie had been chatting online for years without meeting in person,
                    each hiding a crush behind their screens. On 30 November 2022, Jarod decided it
                    was time to change that.
                  </p>
                  <p>
                    From there it was rom-com montage energy — travel, hidden gems, hand in hand —
                    and eventually their gorgeous daughter Brie. Now Montville, and you, are the next
                    chapter.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2 text-pink-400">
                    <Heart size={14} fill="currentColor" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">J & J</span>
                    <Heart size={14} fill="currentColor" />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
