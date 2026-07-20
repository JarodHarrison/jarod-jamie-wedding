"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Copy, Download, Search } from "lucide-react";
import {
  GLOW_UP_PARTY_DATE_LABEL,
  GLOW_UP_PARTY_PUBLIC_PATH,
  GLOW_UP_PARTY_RSVP_DEADLINE_LABEL,
  GLOW_UP_PARTY_TIME_LABEL,
  glowUpInterestLabel,
  glowUpWhiteningLabel,
} from "@/lib/glow-up-party";
import { theme } from "@/lib/theme";

type SerializedInterest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: "teeth" | "botox" | "both";
  whiteningPackage: "WHITENING_ONLY" | "WHITENING_WITH_KIT" | null;
  botoxUnits: number | null;
  fillerMl: number | null;
  notes: string | null;
  source: string;
  guestId: string | null;
};

type Stats = {
  total: number;
  teeth: number;
  pump: number;
  both: number;
  whiteningOnly: number;
  withKit: number;
  totalBotoxUnits: number;
  totalFillerMl: number;
};

type GuestHit = {
  id: string;
  name: string;
  email: string;
  glowUpInterest?: string | null;
};

type GlowUpAdminPortalProps = {
  onBack: () => void;
};

export function GlowUpAdminPortal({ onBack }: GlowUpAdminPortalProps) {
  const [interests, setInterests] = useState<SerializedInterest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GuestHit[]>([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/glow-up-party/admin");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Failed to load.");
        return;
      }
      setInterests(data.interests ?? []);
      setStats(data.stats ?? null);
      setShareUrl(data.shareUrl ?? GLOW_UP_PARTY_PUBLIC_PATH);
    } catch {
      setMessage("Failed to load glow-up data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/glow-up-party/admin/guests?q=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        setHits((data.guests ?? []) as GuestHit[]);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  async function linkGuest(guestId: string) {
    const res = await fetch("/api/glow-up-party/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "link-guest", guestId, interest: "both" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not add guest.");
      return;
    }
    setMessage(`Added ${data.interest.name} to the glow-up list.`);
    setQuery("");
    setHits([]);
    void load();
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Share link copied.");
    } catch {
      setMessage(shareUrl);
    }
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="wedding-screen-top sticky top-0 z-20 border-b bg-[#faf6f2]/95 px-4 pb-4 pt-2 backdrop-blur-md">
        <div className="mb-1 h-1 w-full rounded-full bg-gradient-to-r from-[#b76e79] via-[#c3a379] to-[#b76e79]" />
        <button
          type="button"
          onClick={onBack}
          className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b76e79]"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="font-serif text-2xl text-[#2a2723]">Pump Party HQ</h1>
        <p className="text-xs text-[#3d342f]/60">
          {GLOW_UP_PARTY_DATE_LABEL} · {GLOW_UP_PARTY_TIME_LABEL} · RSVP by{" "}
          {GLOW_UP_PARTY_RSVP_DEADLINE_LABEL}
        </p>
      </div>

      <div className="space-y-6 px-4 pt-4">
        {message ? (
          <p className="rounded-xl bg-[#f7f4ee] px-3 py-2 text-xs text-[#2a2723]">{message}</p>
        ) : null}

        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <>
            {stats ? (
              <section className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["Total", stats.total],
                    ["Whitening", stats.teeth],
                    ["Pump party", stats.pump],
                    ["Both", stats.both],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border bg-white p-3 text-center shadow-sm"
                    style={{ borderColor: theme.border }}
                  >
                    <p className="text-lg font-bold text-[#2a2723]">{value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      {label}
                    </p>
                  </div>
                ))}
              </section>
            ) : null}

            {stats ? (
              <section
                className="rounded-2xl border bg-white p-4 shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                  Totals
                </p>
                <div className="space-y-1 text-sm text-[#2a2723]">
                  <p>Whitening only: {stats.whiteningOnly}</p>
                  <p>Whitening + kit: {stats.withKit}</p>
                  <p>Botox units requested: {stats.totalBotoxUnits}</p>
                  <p>Filler ml requested: {stats.totalFillerMl}</p>
                </div>
              </section>
            ) : null}

            <section
              className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                Share &amp; export
              </p>
              <p className="break-all font-mono text-[11px] text-gray-600">{shareUrl}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyShare()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                  style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                >
                  <Copy size={14} /> Copy link
                </button>
                <a
                  href="/api/glow-up-party/admin/export"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#2a2723]"
                  style={{ borderColor: theme.border }}
                >
                  <Download size={14} /> CSV
                </a>
              </div>
            </section>

            <section
              className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                Add wedding-app guest
              </p>
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guests…"
                  className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] py-2 pl-9 pr-3 text-sm"
                  style={{ borderColor: theme.border }}
                />
              </div>
              {searching ? <p className="text-xs text-gray-400">Searching…</p> : null}
              <ul className="space-y-2">
                {hits.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-col gap-2 rounded-xl bg-[#f7f4ee] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#2a2723]">{g.name}</p>
                      <p className="truncate text-[11px] text-gray-500">{g.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void linkGuest(g.id)}
                      className="shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                    >
                      Add to glow-up
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                Interests ({interests.length})
              </p>
              {interests.length === 0 ? (
                <p className="text-sm text-gray-500">No responses yet. Share the link!</p>
              ) : (
                interests.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                    style={{ borderColor: theme.border }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#2a2723]">{row.name}</p>
                        <p className="truncate text-xs text-gray-500">{row.email}</p>
                        <p className="text-xs text-gray-500">{row.phone}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-[#faf0f0] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#b76e79]">
                        {glowUpInterestLabel(row.interest)}
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1 text-xs text-[#2a2723]">
                      {(row.interest === "teeth" || row.interest === "both") && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-400">Whitening</dt>
                          <dd className="text-right">{glowUpWhiteningLabel(row.whiteningPackage)}</dd>
                        </div>
                      )}
                      {(row.interest === "botox" || row.interest === "both") && (
                        <>
                          <div className="flex justify-between gap-2">
                            <dt className="text-gray-400">Botox units</dt>
                            <dd>{row.botoxUnits ?? "-"}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-gray-400">Filler ml</dt>
                            <dd>{row.fillerMl ?? "-"}</dd>
                          </div>
                        </>
                      )}
                      {row.notes ? (
                        <div className="pt-1">
                          <dt className="text-gray-400">Notes</dt>
                          <dd className="mt-0.5 whitespace-pre-wrap">{row.notes}</dd>
                        </div>
                      ) : null}
                      <div className="flex justify-between gap-2 pt-1 text-[10px] text-gray-400">
                        <span>{row.guestId ? "Linked to guest" : "Not linked"}</span>
                        <span>{row.source === "ADMIN_LINK" ? "Admin link" : "Public page"}</span>
                      </div>
                    </dl>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
