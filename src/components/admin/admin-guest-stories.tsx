"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, EyeOff, Trash2, CheckCircle } from "lucide-react";
import { theme } from "@/lib/theme";
import { guestStoryMoodLabel } from "@/lib/guest-stories";

type AdminStory = {
  id: string;
  content: string;
  mood: string;
  isAnonymous: boolean;
  status: string;
  reportCount: number;
  authorName: string;
  authorEmail: string;
  createdAt: string;
};

type AdminGuestStoriesProps = {
  onMessage: (message: string) => void;
};

export function AdminGuestStories({ onMessage }: AdminGuestStoriesProps) {
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guest-stories");
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error ?? "Failed to load stories.");
        return;
      }
      setStories(data.stories ?? []);
    } catch {
      onMessage("Failed to load stories.");
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  const act = async (id: string, action: "hide" | "approve" | "delete") => {
    setActingId(id);
    try {
      const res = await fetch("/api/admin/guest-stories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error ?? "Action failed.");
        return;
      }
      if (action === "delete") {
        setStories((current) => current.filter((story) => story.id !== id));
      } else {
        setStories((current) =>
          current.map((story) =>
            story.id === id
              ? {
                  ...story,
                  status: action === "hide" ? "HIDDEN" : "APPROVED",
                  reportCount: action === "approve" ? 0 : story.reportCount,
                }
              : story,
          ),
        );
      }
      onMessage(action === "delete" ? "Story deleted." : `Story ${action === "hide" ? "hidden" : "approved"}.`);
    } catch {
      onMessage("Action failed.");
    } finally {
      setActingId(null);
    }
  };

  const hiddenCount = stories.filter((s) => s.status === "HIDDEN").length;
  const reportedCount = stories.filter((s) => s.reportCount > 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total", value: stories.length },
          { label: "Hidden", value: hiddenCount },
          { label: "Reported", value: reportedCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-white p-3 text-center shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <p className="text-lg font-bold text-[#2a2723]">{stat.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading stories…</p>
      ) : stories.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No guest stories yet.</p>
      ) : (
        stories.map((story) => (
          <article
            key={story.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  story.status === "HIDDEN" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {story.status}
              </span>
              {story.reportCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                  <Flag size={10} /> {story.reportCount} report{story.reportCount === 1 ? "" : "s"}
                </span>
              )}
              <span className="text-[9px] uppercase tracking-wider text-gray-400">
                {guestStoryMoodLabel(story.mood)}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#2a2723]">&ldquo;{story.content}&rdquo;</p>
            <p className="mt-2 text-xs text-gray-500">
              {story.isAnonymous ? "Anonymous" : story.authorName} · {story.authorEmail}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {story.status !== "HIDDEN" && (
                <button
                  type="button"
                  disabled={actingId === story.id}
                  onClick={() => void act(story.id, "hide")}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ borderColor: theme.border }}
                >
                  <EyeOff size={12} /> Hide
                </button>
              )}
              {story.status === "HIDDEN" && (
                <button
                  type="button"
                  disabled={actingId === story.id}
                  onClick={() => void act(story.id, "approve")}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                  style={{ borderColor: theme.border }}
                >
                  <CheckCircle size={12} /> Approve
                </button>
              )}
              <button
                type="button"
                disabled={actingId === story.id}
                onClick={() => void act(story.id, "delete")}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
