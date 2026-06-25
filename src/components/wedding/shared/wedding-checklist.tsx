"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { shouldShowInstallGuide } from "@/lib/pwa/install-guide";
import { isWeddingFeatureVisible } from "@/lib/wedding-event";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  tab: AppTab;
};

type WeddingChecklistProps = {
  setActiveTab: (tab: AppTab) => void;
  onOpenInstall?: () => void;
};

export function WeddingChecklist({ setActiveTab, onOpenInstall }: WeddingChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [profileRes, bingoRes, storiesRes] = await Promise.all([
          fetch("/api/guest/profile"),
          fetch("/api/bingo"),
          fetch("/api/guest-stories"),
        ]);

        const profile = profileRes.ok ? (await profileRes.json()).profile : null;
        const bingo = bingoRes.ok ? await bingoRes.json() : null;
        const stories = storiesRes.ok ? (await storiesRes.json()).stories : [];
        const myStories = Array.isArray(stories) ? stories.filter((s: { isMine?: boolean }) => s.isMine) : [];

        const installDone = !shouldShowInstallGuide();

        const checklist: ChecklistItem[] = [
          {
            id: "rsvp",
            label: "RSVP",
            detail: profile?.rsvpStatus === "ACCEPTED" ? "You're in!" : "Let us know you're coming",
            done: profile?.rsvpStatus === "ACCEPTED",
            tab: "rsvp",
          },
          {
            id: "photo",
            label: "Profile photo",
            detail: "Show your face on the guest wall",
            done: Boolean(profile?.hasProfilePhoto),
            tab: "profile",
          },
          {
            id: "story",
            label: "Share a J&J story",
            detail: "Funny, heartfelt, or chaotic — your call",
            done: myStories.length > 0,
            tab: "jarodjamie",
          },
          ...(isWeddingFeatureVisible("photobooth-bingo")
            ? [
                {
                  id: "bingo",
                  label: "Photobooth bingo",
                  detail: bingo?.completed ? "Card cleared!" : "Start ticking off booth shots",
                  done: Boolean(bingo?.checkedItems?.length > 0),
                  tab: "bingo" as AppTab,
                },
              ]
            : []),
          {
            id: "install",
            label: "Install the app",
            detail: "Add to home screen for offline access",
            done: installDone,
            tab: "home",
          },
        ];

        setItems(checklist);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remaining = items.filter((item) => !item.done).length;
  if (loading || remaining === 0) return null;

  return (
    <section
      className="rounded-3xl border bg-white/80 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--wedding-gold)]">
        Your weekend checklist
      </p>
      <p className="mb-4 font-serif text-lg text-[var(--wedding-text-dark)]">
        {remaining} thing{remaining === 1 ? "" : "s"} left to unlock the full experience
      </p>
      <ul className="space-y-2">
        {items
          .filter((item) => !item.done)
          .map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (item.id === "install") onOpenInstall?.();
                  else setActiveTab(item.tab);
                }}
                className="flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors hover:bg-[#f7f4ee]"
                style={{ borderColor: theme.border }}
              >
                <Circle size={16} className="shrink-0 text-gray-300" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[var(--wedding-text-dark)]">{item.label}</span>
                  <span className="block text-xs text-gray-500">{item.detail}</span>
                </span>
                <ChevronRight size={14} className="shrink-0 text-gray-400" />
              </button>
            </li>
          ))}
      </ul>
      {items.every((item) => item.done) && (
        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-600">
          <Check size={14} /> You&apos;re all set for Montville!
        </p>
      )}
    </section>
  );
}
