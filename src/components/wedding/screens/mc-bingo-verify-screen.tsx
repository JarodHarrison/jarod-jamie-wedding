"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Crown, Loader2, Search } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type BingoVerifyRow = {
  guestId: string;
  name: string;
  email: string;
  score: number;
  completedAt: string | null;
  verifiedAt: string | null;
  verifiedByName: string | null;
};

type McBingoVerifyScreenProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function McBingoVerifyScreen({ setActiveTab }: McBingoVerifyScreenProps) {
  const [pending, setPending] = useState<BingoVerifyRow[]>([]);
  const [verified, setVerified] = useState<BingoVerifyRow[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BingoVerifyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bingo/mc");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load verification queue.");
        return;
      }
      setPending(data.pending ?? []);
      setVerified(data.verified ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/bingo/mc?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (res.ok) setResults(data.results ?? []);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  const verifyGuest = async (guestId: string) => {
    setVerifyingId(guestId);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/bingo/mc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      setMessage(data.message ?? "Verified!");
      await loadQueue();
      setQuery("");
      setResults([]);
    } finally {
      setVerifyingId(null);
    }
  };

  const renderRow = (row: BingoVerifyRow, showVerify: boolean) => (
    <div
      key={row.guestId}
      className="rounded-2xl border bg-white/80 p-4 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-[#2a2723]">{row.name}</p>
          <p className="truncate text-xs text-gray-500">{row.email}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
            Score {row.score}
            {row.verifiedAt && row.verifiedByName
              ? ` · Verified by ${row.verifiedByName}`
              : ""}
          </p>
        </div>
        {showVerify && !row.verifiedAt ? (
          <button
            type="button"
            disabled={verifyingId === row.guestId}
            onClick={() => void verifyGuest(row.guestId)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            {verifyingId === row.guestId ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Crown size={12} />
            )}
            Verify
          </button>
        ) : (
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader
        title="MC Bingo Verify"
        subtitle="Drag queen official stamp"
        onBack={() => setActiveTab("home")}
      />

      <div className="mt-6 space-y-6 px-6">
        <div
          className="rounded-3xl border bg-white/70 p-5 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <p className="text-sm text-gray-600">
            When a guest completes Photobooth Bingo, they should bring their phone to you. Search their
            name or pick them from the queue, then tap Verify.
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest name..."
            className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--wedding-gold)]"
            style={{ borderColor: theme.border }}
          />
        </div>

        {searching && <p className="text-center text-xs text-gray-400">Searching...</p>}

        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Search results</p>
            {results.map((row) => renderRow(row, Boolean(row.completedAt)))}
          </div>
        )}

        {message && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading queue...</p>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Awaiting verification ({pending.length})
              </p>
              {pending.length === 0 ? (
                <p className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-gray-500" style={{ borderColor: theme.border }}>
                  No bingo cards waiting right now.
                </p>
              ) : (
                pending.map((row) => renderRow(row, true))
              )}
            </div>

            {verified.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Recently verified
                </p>
                {verified.map((row) => renderRow(row, false))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
