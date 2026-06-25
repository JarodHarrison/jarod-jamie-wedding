"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, Crown, Sparkles, Trophy, X, Zap } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import { theme } from "@/lib/theme";
import { showOsNotification } from "@/lib/os-notifications";
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
  verified: boolean;
  verifiedAt: string | null;
};

type LeaderboardEntry = {
  guestId: string;
  name: string;
  score: number;
  completed: boolean;
  verified: boolean;
  photoUrl: string;
};

type LeaderboardState = {
  leaders: LeaderboardEntry[];
  stats: { playing: number; completed: number; nearComplete: number; maxScore: number };
  viewer?: {
    rank: number | null;
    score: number;
    isLeader: boolean;
    leaderAlert: string | null;
    chaserAlert: string | null;
  };
};

const LEADERBOARD_PLACEHOLDER = "/kiosk/default-guest.svg";

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
    verified: false,
    verifiedAt: null,
  };
}

function parseBingoResponse(data: {
  items?: BingoItem[];
  checkedItems?: string[];
  score?: number;
  maxScore?: number;
  completed?: boolean;
  verified?: boolean;
  verifiedAt?: string | null;
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
    verified: Boolean(data.verified),
    verifiedAt: data.verifiedAt ?? null,
  };
}

function notifyBingoVerificationNeeded() {
  void showOsNotification({
    title: "Bingo!",
    body: "Take your phone to the nearest drag queen so they can verify your win.",
  });
}

export function PhotoboothBingoScreen({ setActiveTab }: PhotoboothBingoScreenProps) {
  const [state, setState] = useState<BingoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardState | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const wasCompletedRef = useRef(false);

  const handleBingoCompletion = useCallback((next: BingoState) => {
    const justCompleted = next.completed && !wasCompletedRef.current;
    wasCompletedRef.current = next.completed;

    if (justCompleted && !next.verified) {
      setVerifyModalOpen(true);
      notifyBingoVerificationNeeded();
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/bingo/leaderboard");
      if (res.ok) setLeaderboard(await res.json());
    } catch {
      // non-blocking
    }
  }, []);

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

      const parsed = parseBingoResponse(data);
      wasCompletedRef.current = parsed.completed;
      setState(parsed);
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
    void loadLeaderboard();
  }, [loadBingo, loadLeaderboard]);

  useEffect(() => {
    if (!state?.completed || state.verified) return;

    const interval = window.setInterval(() => {
      void loadBingo();
      void loadLeaderboard();
    }, 15_000);

    return () => window.clearInterval(interval);
  }, [state?.completed, state?.verified, loadBingo, loadLeaderboard]);

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
      setState((current) => {
        if (!current) return current;
        const next = {
          ...current,
          checkedItems: data.checkedItems,
          score: data.score,
          completed: data.completed,
          verified: Boolean(data.verified),
          verifiedAt: data.verifiedAt ?? null,
        };
        handleBingoCompletion(next);
        return next;
      });
      void loadLeaderboard();
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

      {verifyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bingo-verify-title"
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[1.75rem] border bg-white shadow-2xl"
            style={{ borderColor: theme.border }}
          >
            <img
              src={ANNITA_BINGO_IMAGE}
              alt="Annita celebrating bingo"
              className="h-40 w-full object-cover object-top"
            />
            <div className="p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2" style={{ color: theme.gold }}>
                  <Sparkles size={16} />
                  <p
                    id="bingo-verify-title"
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Bingo!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                  aria-label="Dismiss"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="font-serif text-2xl text-[#2a2723]">You cleared the card!</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Every guest just got the good news from Annita. Now grab your phone and head to the
                nearest drag queen — they will verify your win as an official MC.
              </p>
              <div
                className="mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-xs"
                style={{ borderColor: theme.gold, backgroundColor: theme.cardBg, color: theme.textDark }}
              >
                <Crown size={16} className="mt-0.5 shrink-0" style={{ color: theme.gold }} />
                <span>Keep this screen open — your MC will tap Verify when they see you.</span>
              </div>
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="mt-5 w-full rounded-full py-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: theme.btnDark, color: theme.gold }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

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
                  everyone, courtesy of Annita. Then take your phone to a drag queen for official
                  verification.
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

            {(leaderboard.viewer?.leaderAlert || leaderboard.viewer?.chaserAlert) && (
              <div className="mb-4 space-y-2">
                {leaderboard.viewer?.leaderAlert && (
                  <div
                    className="flex items-start gap-2 rounded-2xl border px-3 py-2.5 text-xs"
                    style={{ borderColor: theme.gold, backgroundColor: theme.cardBg, color: theme.textDark }}
                  >
                    <Zap size={14} className="mt-0.5 shrink-0" style={{ color: theme.gold }} />
                    <span>{leaderboard.viewer.leaderAlert}</span>
                  </div>
                )}
                {leaderboard.viewer?.chaserAlert && (
                  <div
                    className="flex items-start gap-2 rounded-2xl border px-3 py-2.5 text-xs"
                    style={{ borderColor: theme.border, backgroundColor: "rgba(255,255,255,0.9)", color: theme.textDark }}
                  >
                    <Trophy size={14} className="mt-0.5 shrink-0" style={{ color: theme.gold }} />
                    <span>{leaderboard.viewer.chaserAlert}</span>
                  </div>
                )}
              </div>
            )}

            <ul className="space-y-3">
              {leaderboard.leaders.slice(0, 5).map((entry, index) => (
                <li key={entry.guestId} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 font-bold text-[var(--wedding-gold)]">#{index + 1}</span>
                    <div
                      className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2"
                      style={{ borderColor: index === 0 ? theme.gold : theme.border }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.photoUrl || LEADERBOARD_PLACEHOLDER}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="truncate text-[var(--wedding-text-dark)]">
                      {entry.name}
                      {entry.verified && " 👑"}
                      {entry.completed && !entry.verified && " ✨"}
                    </span>
                  </div>
                  <span className="shrink-0 font-serif text-[var(--wedding-gold)]">
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
                {state.verified ? <Crown size={16} /> : <Sparkles size={16} />}
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  {state.verified ? "Verified winner" : "Bingo!"}
                </p>
                {state.verified ? <Crown size={16} /> : <Sparkles size={16} />}
              </div>
              <p className="font-serif text-xl" style={{ color: theme.textDark }}>
                {state.verified ? "Drag queen approved" : "You cleared the card"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {state.verified
                  ? "Your win is officially verified. Enjoy the bragging rights!"
                  : "Take your phone to the nearest drag queen for verification."}
              </p>
              {!state.verified && (
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                  style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                >
                  <Crown size={12} />
                  Show verification reminder
                </button>
              )}
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
