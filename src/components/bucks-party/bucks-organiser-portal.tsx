"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Copy, Download, Search } from "lucide-react";
import { BUCKS_PARTY_PUBLIC_PATH } from "@/lib/bucks-party";
import type { BucksPartyConfigData } from "@/lib/bucks-party-config";
import {
  datetimeLocalValueToIso,
  isoToDatetimeLocalValue,
} from "@/lib/bucks-party-config";
import { theme } from "@/lib/theme";

type SerializedBucksRsvp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  attending: boolean;
  plusOneName: string | null;
  budgetChoice: number | null;
  source: string;
  prepaid: boolean;
};

type Stats = {
  total: number;
  attending: number;
  declined: number;
  prepaid: number;
  unpaid: number;
  budget: Record<100 | 130 | 150, number>;
};

type Organiser = { id: string; name: string; email: string };

type GuestHit = {
  id: string;
  name: string;
  email: string;
  isBucksPartyAdmin?: boolean;
};

type EventFormState = {
  dateLabel: string;
  dateShort: string;
  timeLabel: string;
  placeLabel: string;
  placeNote: string;
  detailsNote: string;
  dressCode: string;
  whatToBring: string;
  meetingPoint: string;
  transportNote: string;
  agendaNote: string;
  startAtLocal: string;
  endAtLocal: string;
  calendarDescription: string;
  calendarLocation: string;
  shareBlurb: string;
};

function eventToForm(event: BucksPartyConfigData): EventFormState {
  return {
    dateLabel: event.dateLabel,
    dateShort: event.dateShort,
    timeLabel: event.timeLabel,
    placeLabel: event.placeLabel,
    placeNote: event.placeNote ?? "",
    detailsNote: event.detailsNote ?? "",
    dressCode: event.dressCode ?? "",
    whatToBring: event.whatToBring ?? "",
    meetingPoint: event.meetingPoint ?? "",
    transportNote: event.transportNote ?? "",
    agendaNote: event.agendaNote ?? "",
    startAtLocal: isoToDatetimeLocalValue(event.startAt),
    endAtLocal: isoToDatetimeLocalValue(event.endAt),
    calendarDescription: event.calendarDescription ?? "",
    calendarLocation: event.calendarLocation ?? "",
    shareBlurb: event.shareBlurb ?? "",
  };
}

type BucksOrganiserPortalProps = {
  onBack: () => void;
  canAppointOrganisers?: boolean;
};

export function BucksOrganiserPortal({
  onBack,
  canAppointOrganisers = false,
}: BucksOrganiserPortalProps) {
  const [rsvps, setRsvps] = useState<SerializedBucksRsvp[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [event, setEvent] = useState<BucksPartyConfigData | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [stripeLive, setStripeLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GuestHit[]>([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bucks-party/organiser");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Failed to load.");
        return;
      }
      setRsvps(data.rsvps ?? []);
      setStats(data.stats ?? null);
      setOrganisers(data.organisers ?? []);
      if (data.event) {
        setEvent(data.event as BucksPartyConfigData);
        setEventForm(eventToForm(data.event as BucksPartyConfigData));
      }
      setShareUrl(data.shareUrl ?? BUCKS_PARTY_PUBLIC_PATH);
      setStripeLive(Boolean(data.stripeLive));
    } catch {
      setMessage("Failed to load bucks data.");
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
          `/api/bucks-party/organiser/guests?q=${encodeURIComponent(query.trim())}`,
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

  async function patch(id: string, patchBody: Record<string, unknown>) {
    const res = await fetch("/api/bucks-party/organiser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "patch", id, ...patchBody }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Update failed.");
      return;
    }
    setRsvps((prev) => prev.map((r) => (r.id === id ? data.rsvp : r)));
    void load();
  }

  async function linkGuest(guestId: string) {
    const res = await fetch("/api/bucks-party/organiser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "link-guest", guestId, attending: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not add guest.");
      return;
    }
    setMessage(`Added ${data.rsvp.name} to the bucks list.`);
    setQuery("");
    setHits([]);
    void load();
  }

  async function toggleOrganiser(guestId: string, enabled: boolean) {
    const res = await fetch("/api/bucks-party/organiser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-organiser", guestId, enabled }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not update organiser.");
      return;
    }
    setMessage(
      enabled
        ? `${data.guest.name} is now a bucks organiser.`
        : `${data.guest.name} removed as organiser.`,
    );
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

  async function saveEventDetails() {
    if (!eventForm) return;
    const startAt = datetimeLocalValueToIso(eventForm.startAtLocal);
    const endAt = datetimeLocalValueToIso(eventForm.endAtLocal);
    if (!startAt || !endAt) {
      setMessage("Start and end date/time are required.");
      return;
    }

    setSavingEvent(true);
    try {
      const res = await fetch("/api/bucks-party/organiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-event",
          dateLabel: eventForm.dateLabel,
          dateShort: eventForm.dateShort,
          timeLabel: eventForm.timeLabel,
          placeLabel: eventForm.placeLabel,
          placeNote: eventForm.placeNote || null,
          detailsNote: eventForm.detailsNote || null,
          dressCode: eventForm.dressCode || null,
          whatToBring: eventForm.whatToBring || null,
          meetingPoint: eventForm.meetingPoint || null,
          transportNote: eventForm.transportNote || null,
          agendaNote: eventForm.agendaNote || null,
          startAt,
          endAt,
          calendarDescription: eventForm.calendarDescription || null,
          calendarLocation: eventForm.calendarLocation || null,
          shareBlurb: eventForm.shareBlurb || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not save event details.");
        return;
      }
      setEvent(data.event);
      setEventForm(eventToForm(data.event));
      setMessage(
        "Bucks party details updated. Public page refreshes straight away: hard-refresh if a tab was already open.",
      );
    } catch {
      setMessage("Could not save event details.");
    } finally {
      setSavingEvent(false);
    }
  }

  return (
    <div className="animate-fade-in pb-10">
      <div className="wedding-screen-top sticky top-0 z-20 border-b bg-[#1a0f24]/95 px-4 pb-4 pt-2 backdrop-blur-md">
        <div className="mb-1 h-1 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-35% via-green-500 to-purple-600" />
        <button
          type="button"
          onClick={onBack}
          className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-pink-300"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="font-serif text-2xl text-white">Bucks Organiser</h1>
        <p className="text-xs text-white/60">
          {event?.dateLabel ?? "Bucks party"} · joint bucks HQ
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
                    ["RSVP yes", stats.attending],
                    ["RSVP no", stats.declined],
                    ["Prepaid", stats.prepaid],
                    ["Unpaid", stats.unpaid],
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
                  Budget votes (attending)
                </p>
                <div className="space-y-1 text-sm text-[#2a2723]">
                  <p>$150: {stats.budget[150]}</p>
                  <p>$130: {stats.budget[130]}</p>
                  <p>$100: {stats.budget[100]}</p>
                </div>
              </section>
            ) : null}

            {eventForm ? (
              <section
                className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                    Event details
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Updates the public bucks page (date, place, time, guest info, and the closing line
                    from the share message), countdown, calendar invites, itinerary, and Share
                    button text.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Date (display)
                    </span>
                    <input
                      value={eventForm.dateLabel}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, dateLabel: e.target.value } : f))
                      }
                      className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Date short (itinerary)
                    </span>
                    <input
                      value={eventForm.dateShort}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, dateShort: e.target.value } : f))
                      }
                      placeholder="29.08"
                      className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Time (display)
                    </span>
                    <input
                      value={eventForm.timeLabel}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, timeLabel: e.target.value } : f))
                      }
                      placeholder="Coming Soon"
                      className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Place
                    </span>
                    <input
                      value={eventForm.placeLabel}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, placeLabel: e.target.value } : f))
                      }
                      className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Place note
                    </span>
                    <textarea
                      value={eventForm.placeNote}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, placeNote: e.target.value } : f))
                      }
                      rows={2}
                      className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Countdown / calendar start
                    </span>
                    <input
                      type="datetime-local"
                      value={eventForm.startAtLocal}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, startAtLocal: e.target.value } : f))
                      }
                      className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Calendar end
                    </span>
                    <input
                      type="datetime-local"
                      value={eventForm.endAtLocal}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, endAtLocal: e.target.value } : f))
                      }
                      className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                </div>

                <div className="space-y-3 border-t pt-4" style={{ borderColor: theme.border }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                      Guest info
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Leave blank until you know: empty fields stay hidden on the public page.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Dress code
                      </span>
                      <textarea
                        value={eventForm.dressCode}
                        onChange={(e) =>
                          setEventForm((f) => (f ? { ...f, dressCode: e.target.value } : f))
                        }
                        rows={2}
                        placeholder="What to wear"
                        className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                        style={{ borderColor: theme.border }}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        What to bring
                      </span>
                      <textarea
                        value={eventForm.whatToBring}
                        onChange={(e) =>
                          setEventForm((f) => (f ? { ...f, whatToBring: e.target.value } : f))
                        }
                        rows={2}
                        placeholder="Kit, cash, ID…"
                        className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                        style={{ borderColor: theme.border }}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Meeting point
                      </span>
                      <textarea
                        value={eventForm.meetingPoint}
                        onChange={(e) =>
                          setEventForm((f) => (f ? { ...f, meetingPoint: e.target.value } : f))
                        }
                        rows={2}
                        placeholder="Exact address or meet spot"
                        className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                        style={{ borderColor: theme.border }}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Transport / parking
                      </span>
                      <textarea
                        value={eventForm.transportNote}
                        onChange={(e) =>
                          setEventForm((f) => (f ? { ...f, transportNote: e.target.value } : f))
                        }
                        rows={2}
                        placeholder="Uber, buses, parking…"
                        className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                        style={{ borderColor: theme.border }}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Agenda / run-of-show
                      </span>
                      <textarea
                        value={eventForm.agendaNote}
                        onChange={(e) =>
                          setEventForm((f) => (f ? { ...f, agendaNote: e.target.value } : f))
                        }
                        rows={3}
                        placeholder="Rough timing once known"
                        className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                        style={{ borderColor: theme.border }}
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Anything else (public page)
                      </span>
                      <textarea
                        value={eventForm.detailsNote}
                        onChange={(e) =>
                          setEventForm((f) => (f ? { ...f, detailsNote: e.target.value } : f))
                        }
                        rows={3}
                        placeholder="Catch-all for one-offs that don’t fit above"
                        className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                        style={{ borderColor: theme.border }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Calendar location
                    </span>
                    <input
                      value={eventForm.calendarLocation}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, calendarLocation: e.target.value } : f))
                      }
                      className="min-h-11 w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 text-sm"
                      style={{ borderColor: theme.border }}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Share message
                    </span>
                    <textarea
                      value={eventForm.shareBlurb}
                      onChange={(e) =>
                        setEventForm((f) => (f ? { ...f, shareBlurb: e.target.value } : f))
                      }
                      rows={5}
                      className="w-full rounded-xl border bg-[#f7f4ee] px-3 py-2 font-mono text-xs"
                      style={{ borderColor: theme.border }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Used by the Share button. The last line before &quot;RSVP:&quot; also becomes
                      the closing line on the public bucks page.
                    </p>
                  </label>
                </div>
                <button
                  type="button"
                  disabled={savingEvent}
                  onClick={() => void saveEventDetails()}
                  className="min-h-11 w-full rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
                  style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                >
                  {savingEvent ? "Saving…" : "Save event details"}
                </button>
              </section>
            ) : null}

            <section
              className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                Share & export
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
                  href="/api/bucks-party/organiser/export"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#2a2723]"
                  style={{ borderColor: theme.border }}
                >
                  <Download size={14} /> CSV
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Stripe prepay: {stripeLive ? "Live" : "Not live yet (add Payment Link closer to date)"}
              </p>
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void linkGuest(g.id)}
                        className="shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                      >
                        Add to bucks
                      </button>
                      {canAppointOrganisers ? (
                        <button
                          type="button"
                          onClick={() => void toggleOrganiser(g.id, !g.isBucksPartyAdmin)}
                          className="shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#2a2723]"
                          style={{ borderColor: theme.border }}
                        >
                          {g.isBucksPartyAdmin ? "Remove organiser" : "Make organiser"}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                RSVPs ({rsvps.length})
              </p>
              {rsvps.length === 0 ? (
                <p className="text-sm text-gray-500">No RSVPs yet. Share the link!</p>
              ) : (
                rsvps.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                    style={{ borderColor: theme.border }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-[#2a2723]">{r.name}</p>
                        <p className="truncate text-xs text-gray-500">{r.email}</p>
                        <p className="text-xs text-gray-500">{r.phone}</p>
                        {r.plusOneName ? (
                          <p className="text-xs text-gray-500">+1 {r.plusOneName}</p>
                        ) : null}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
                          r.attending ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.attending ? "Yes" : "No"}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500">
                      Budget: {r.budgetChoice ? `$${r.budgetChoice}` : "-"} ·{" "}
                      {r.source === "ADMIN_LINK" ? "From app" : "Public link"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void patch(r.id, { prepaid: !r.prepaid })}
                        className="min-h-10 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ borderColor: theme.border }}
                      >
                        {r.prepaid ? "Mark unpaid" : "Mark prepaid"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void patch(r.id, { attending: !r.attending })}
                        className="min-h-10 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ borderColor: theme.border }}
                      >
                        Toggle RSVP
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>

            <section
              className="rounded-2xl border bg-white p-4 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                Organisers
              </p>
              <ul className="space-y-2 text-sm text-[#2a2723]">
                {organisers.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2">
                    <span>
                      {o.name}
                      <span className="block text-[11px] text-gray-500">{o.email}</span>
                    </span>
                    {canAppointOrganisers ? (
                      <button
                        type="button"
                        onClick={() => void toggleOrganiser(o.id, false)}
                        className="text-[10px] font-bold uppercase tracking-wider text-rose-600"
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              {canAppointOrganisers ? (
                <p className="mt-3 text-[11px] text-gray-500">
                  To appoint someone new, add them from guest search then use Admin → Bucks Party, or
                  search below after they&apos;re in the guest list and toggle via admin section.
                </p>
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
