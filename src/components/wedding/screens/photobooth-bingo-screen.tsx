"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, Check, Sparkles } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import { theme } from "@/lib/theme";
import {
  ANNITA_BINGO_IMAGE,
  PHOTOBOOTH_BINGO_ITEMS,
  PHOTOBOOTH_BINGO_MAX_SCORE,
  scoreBingoItems,
} from "@/lib/photobooth-bingo";
import type { AppTab } from "@/types/wedding";

type BingoItem = {
  id: string;
  label: string;
  points: number;
};

type BingoState = {
  items: BingoItem[];
  checkedItems: string[];
  score: number;
  maxScore: number;
  completed: boolean;
};

type PhotoboothBingoScreenProps = {
  setActiveTab: (tab: AppTab) => void;
};

function emptyBingoState(): BingoState {
  return {
    items: PHOTOBOOTH_BINGO_ITEMS,
    checkedItems: [],
    score: 0,
    maxScore: PHOTOBOOTH_BINGO_MAX_SCORE,
    completed: false,
  };
}

function parseBingoResponse(data: {
  items?: BingoItem[];
  checkedItems?: string[];
  score?: number;
  maxScore?: number;
  completed?: boolean;
}): BingoState {
  const items =
    Array.isArray(data.items) && data.items.length > 0 ? data.items : PHOTOBOOTH_BINGO_ITEMS;
  const checkedItems = Array.isArray(data.checkedItems) ? data.checkedItems : [];
  const maxScore = data.maxScore ?? PHOTOBOOTH_BINGO_MAX_SCORE;

  return {
    items,
    checkedItems,
    score: typeof data.score === "number" ? data.score : scoreBingoItems(checkedItems),
    maxScore,
    completed: Boolean(data.completed),
  };
}

export function PhotoboothBingoScreen({ setActiveTab }: PhotoboothBingoScreenProps) {
  const [state, setState] = useState<BingoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<{
    leaders: { name: string; score: number; completed: boolean }[];
    stats: { playing: number; completed: number; nearComplete: number; maxScore: number };
  } | null>(null);

  const loadBingo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bingo");
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setState(emptyBingoState());
        setError("Please sign in to save your bingo progress.");
        return;
      }

      if (!res.ok) {
        setState(emptyBingoState());
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not sync bingo progress — showing the card offline.",
        );
        return;
      }

      setState(parseBingoResponse(data));
      if (data.progressUnavailable) {
        setError("Progress could not be loaded from the server — ticks may not save until this is fixed.");
      } else {
        setError("");
      }
    } catch {
      setState(emptyBingoState());
      setError("Could not reach the server — showing the bingo card offline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBingo();
    void (async () => {
      try {
        const res = await fetch("/api/bingo/leaderboard");
        if (res.ok) setLeaderboard(await res.json());
      } catch {
        // non-blocking
      }
    })();
  }, [loadBingo]);

  const toggleItem = async (itemId: string, checked: boolean) => {
    if (!state || savingId) return;

    const previous = state;
    const optimisticChecked = checked
      ? Array.from(new Set([...state.checkedItems, itemId]))
      : state.checkedItems.filter((id) => id !== itemId);

    const optimisticScore = state.items
      .filter((item) => optimisticChecked.includes(item.id))
      .reduce((total, item) => total + item.points, 0);

    setState({
      ...state,
      checkedItems: optimisticChecked,
      score: optimisticScore,
    });
    setSavingId(itemId);

    try {
      const res = await fetch("/api/bingo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, checked }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      setState((current) =>
        current
          ? {
              ...current,
              checkedItems: data.checkedItems,
              score: data.score,
              completed: data.completed,
            }
          : current,
      );
    } catch {
      setState(previous);
      setError("Could not save that tick. Try again.");
    } finally {
      setSavingId(null);
    }
  };

    const progress =
    state && state.items.length > 0
      ? Math.round((state.checkedItems.length / state.items.length) * 100)
      : 0;

  const displayState = state ?? emptyBingoState();

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader
        title="Photobooth Bingo"
        subtitle="Strike a pose"
        onBack={() => setActiveTab("photos")}
      />

      <div className="mt-6 space-y-6 px-6">
        <ContentAccordion
          defaultOpenId="how-to"
          items={[
            {
              id: "how-to",
              title: "How to play",
              content: (
                <p>
                  Snap each challenge at the photobooth (or anywhere the vibe fits). Tick them off as
                  you go — first guest to clear the whole card triggers a &ldquo;Bingo!&rdquo; announcement to
                  everyone, courtesy of Annita.
                </p>
              ),
            },
          ]}
        />
        <div
          className="overflow-hidden rounded-3xl border bg-white/70 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <div
            className="flex items-center gap-4 border-b px-5 py-4"
            style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              <Camera size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg" style={{ color: theme.textDark }}>
                For the camera
              </p>
              <p className="text-xs text-gray-500">
                Tick each shot as you nail it at the photobooth. First to complete everything wins bragging rights — and Annita tells everyone.
              </p>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-2 flex items-end justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your score</p>
              <p className="font-serif text-2xl" style={{ color: theme.gold }}>
                {displayState.score}
                <span className="text-sm text-gray-400"> / {displayState.maxScore}</span>
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500 wedding-nav-active"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-400">
              {displayState.checkedItems.length} of {displayState.items.length} captured
              {leaderboard && leaderboard.stats.playing > 0 && (
                <> · {leaderboard.stats.playing} guests playing</>
              )}
            </p>
          </div>
        </div>

        {leaderboard && leaderboard.leaders.length > 0 && (
          <div
            className="rounded-3xl border bg-white/70 p-5 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Leaderboard
            </p>
            <ul className="space-y-2">
              {leaderboard.leaders.slice(0, 5).map((entry, index) => (
                <li key={`${entry.name}-${index}`} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--wedding-text-dark)]">
                    <span className="mr-2 font-bold text-[var(--wedding-gold)]">#{index + 1}</span>
                    {entry.name}
                    {entry.completed && " ✨"}
                  </span>
                  <span className="font-serif text-[var(--wedding-gold)]">
                    {entry.score}/{leaderboard.stats.maxScore}
                  </span>
                </li>
              ))}
            </ul>
            {leaderboard.stats.nearComplete > 0 && (
              <p className="mt-3 text-xs text-gray-500">
                {leaderboard.stats.nearComplete} guest
                {leaderboard.stats.nearComplete === 1 ? "" : "s"} almost at bingo!
              </p>
            )}
          </div>
        )}

        {state?.completed && (
          <div
            className="overflow-hidden rounded-3xl border text-center shadow-md"
            style={{ borderColor: theme.border }}
          >
            <img
              src={ANNITA_BINGO_IMAGE}
              alt="Annita celebrating a bingo win"
              className="h-48 w-full object-cover object-top"
            />
            <div className="px-5 py-4" style={{ backgroundColor: theme.cardBg }}>
              <div className="mb-2 flex items-center justify-center gap-2" style={{ color: theme.gold }}>
                <Sparkles size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Bingo!</p>
                <Sparkles size={16} />
              </div>
              <p className="font-serif text-xl" style={{ color: theme.textDark }}>
                You cleared the card
              </p>
              <p className="mt-1 text-sm text-gray-500">Every guest just got the good news.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadBingo()}
              className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading your card...</p>
        ) : state ? (
          <div className="space-y-3">
            {displayState.items.map((item) => {
              const isChecked = displayState.checkedItems.includes(item.id);
              const isSaving = savingId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={Boolean(savingId)}
                  onClick={() => void toggleItem(item.id, !isChecked)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                    isChecked ? "bg-white shadow-sm" : "bg-white/60"
                  } ${isSaving ? "opacity-70" : ""}`}
                  style={{ borderColor: isChecked ? theme.gold : theme.border }}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                      isChecked ? "wedding-nav-active border-transparent" : "border-gray-200 bg-white"
                    }`}
                  >
                    {isChecked && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium ${isChecked ? "line-through opacity-70" : ""}`}
                      style={{ color: theme.textDark }}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: theme.cardBg, color: theme.gold }}
                  >
                    {item.points} pt{item.points === 1 ? "" : "s"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
