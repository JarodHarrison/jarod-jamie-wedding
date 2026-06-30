"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Plane } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { ReturnShuttleRegistrationPanel } from "@/components/wedding/forms/return-shuttle-registration";
import { airportLabel, formatTravelWhen } from "@/lib/transfer-match-labels";
import { ARRIVAL_MAX_WAIT_OPTIONS, arrivalMaxWaitLabel } from "@/lib/transfer-arrival-wait";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

type TransferMatch = {
  id: string;
  kind: "ARRIVAL" | "DEPARTURE";
  status: "PENDING" | "INTRODUCED" | "DECLINED";
  myConsent: boolean | null;
  otherGuest: {
    id: string;
    name: string;
    arrivalAirport: string | null;
    arrivalDate: string | null;
    arrivalTime: string | null;
    arrivalMaxWait: string | null;
    departureAirport: string | null;
    departureDate: string | null;
    departureTime: string | null;
  };
  introducedAt: string | null;
  createdAt: string;
};

function matchSummary(match: TransferMatch): string {
  const other = match.otherGuest;
  if (match.kind === "ARRIVAL") {
    const waitLabel = arrivalMaxWaitLabel(other.arrivalMaxWait);
    const waitNote = waitLabel ? `, can wait ${waitLabel}` : "";
    return `${other.name} — arriving ${airportLabel(other.arrivalAirport)}, ${formatTravelWhen(other.arrivalDate, other.arrivalTime)}${waitNote}`;
  }
  return `${other.name} — departing ${airportLabel(other.departureAirport)}, ${formatTravelWhen(other.departureDate, other.departureTime)}`;
}

export function TransferShareForm() {
  const { profile, loading, error, saveSection, setError } = useGuestProfile();
  const [wantsSharedTransfer, setWantsSharedTransfer] = useState(true);
  const [shareTransferContactDetails, setShareTransferContactDetails] = useState(false);
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [arrivalMaxWait, setArrivalMaxWait] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [passengerCount, setPassengerCount] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [returnShuttleInterest, setReturnShuttleInterest] = useState(false);
  const [returnShuttleAirport, setReturnShuttleAirport] = useState("");
  const [matches, setMatches] = useState<TransferMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true);
    try {
      const res = await fetch("/api/guest/transfer-matches", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMatches(data.matches ?? []);
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!profile) return;
    setWantsSharedTransfer(profile.wantsSharedTransfer ?? true);
    setShareTransferContactDetails(profile.shareTransferContactDetails ?? false);
    setArrivalAirport(profile.arrivalAirport ?? "");
    setArrivalDate(profile.arrivalDate ?? "");
    setArrivalTime(profile.arrivalTime ?? "");
    setArrivalMaxWait(profile.arrivalMaxWait ?? "");
    setDepartureAirport(profile.departureAirport ?? "");
    setDepartureDate(profile.departureDate ?? "");
    setDepartureTime(profile.departureTime ?? "");
    setFlightNumber(profile.flightNumber ?? "");
    setPassengerCount(profile.passengerCount?.toString() ?? "");
    setTransferNotes(profile.transferNotes ?? "");
    setReturnShuttleInterest(profile.returnShuttleInterest ?? false);
    setReturnShuttleAirport(profile.returnShuttleAirport ?? "");
    void loadMatches();
  }, [profile, loadMatches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);

    const result = await saveSection("transfer", {
      wantsSharedTransfer,
      shareTransferContactDetails,
      arrivalAirport,
      arrivalDate,
      arrivalTime,
      arrivalMaxWait: arrivalMaxWait || null,
      departureAirport,
      departureDate,
      departureTime,
      flightNumber,
      passengerCount: passengerCount ? Number(passengerCount) : null,
      transferNotes,
      returnShuttleInterest,
      returnShuttleAirport: returnShuttleInterest ? returnShuttleAirport : null,
    });

    setSubmitting(false);
    if (result.ok) {
      setSaved(true);
      void loadMatches();
    }
  };

  const respondToMatch = async (matchId: string, accept: boolean) => {
    setRespondingId(matchId);
    setError("");
    try {
      const res = await fetch(`/api/guest/transfer-matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update match.");
        return;
      }
      setMatches(data.matches ?? []);
    } finally {
      setRespondingId(null);
    }
  };

  const pendingMatches = matches.filter((match) => match.status === "PENDING");
  const introducedMatches = matches.filter((match) => match.status === "INTRODUCED");

  if (loading) {
    return <p className="text-sm text-gray-400">Loading your details...</p>;
  }

  return (
    <form id="shared-transfer-form" onSubmit={handleSubmit} className="space-y-3">
      <label
        className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-600"
        style={{ borderColor: theme.border }}
      >
        <input
          type="checkbox"
          checked={wantsSharedTransfer}
          onChange={(e) => setWantsSharedTransfer(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        I&apos;m interested in sharing airport transport
      </label>

      {wantsSharedTransfer && (
        <label
          className="flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-600"
          style={{ borderColor: theme.border }}
        >
          <input
            type="checkbox"
            checked={shareTransferContactDetails}
            onChange={(e) => setShareTransferContactDetails(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
          />
          <span>
            I&apos;m happy for Jarod &amp; Jamie to introduce me to another guest with similar
            flight times and share my email and phone if we both agree.
          </span>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <select
          value={arrivalAirport}
          onChange={(e) => setArrivalAirport(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        >
          <option value="">Arrival airport</option>
          <option value="MCY">Sunshine Coast (MCY)</option>
          <option value="BNE">Brisbane (BNE)</option>
        </select>
        <input
          type="text"
          placeholder="Flight number"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={arrivalDate}
          onChange={(e) => setArrivalDate(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
        <input
          type="time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
      </div>
      <label className="block text-xs font-medium text-gray-600">
        After I land, I can wait up to…
        <select
          value={arrivalMaxWait}
          onChange={(e) => setArrivalMaxWait(e.target.value)}
          className={`${inputClass} mt-1`}
          style={{ borderColor: theme.border }}
        >
          <option value="">Select wait time (for travel buddy matching)</option>
          {ARRIVAL_MAX_WAIT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-[11px] font-normal text-gray-400">
          We only match you with guests whose arrival window overlaps yours — shorter waits mean
          fewer matches, but no hanging around.
        </span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={departureAirport}
          onChange={(e) => setDepartureAirport(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        >
          <option value="">Departure airport</option>
          <option value="MCY">Sunshine Coast (MCY)</option>
          <option value="BNE">Brisbane (BNE)</option>
        </select>
        <input
          type="number"
          min={1}
          placeholder="Passengers"
          value={passengerCount}
          onChange={(e) => setPassengerCount(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
        <input
          type="time"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
      </div>
      <textarea
        placeholder="Notes (flexible times, luggage, etc.)"
        rows={2}
        value={transferNotes}
        onChange={(e) => setTransferNotes(e.target.value)}
        className={`${inputClass} resize-none`}
        style={{ borderColor: theme.border }}
      />

      <ReturnShuttleRegistrationPanel
        returnShuttleInterest={returnShuttleInterest}
        returnShuttleAirport={returnShuttleAirport}
        onInterestChange={(interest, airport) => {
          setReturnShuttleInterest(interest);
          setReturnShuttleAirport(airport);
        }}
      />

      {(pendingMatches.length > 0 || introducedMatches.length > 0) && (
        <div
          className="space-y-3 rounded-2xl border bg-[#faf8f4] p-4"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            <Plane size={14} />
            Travel buddies
          </div>

          {matchesLoading && (
            <p className="text-xs text-gray-400">Checking for matches…</p>
          )}

          {pendingMatches.map((match) => (
            <div
              key={match.id}
              className="rounded-xl border bg-white p-3"
              style={{ borderColor: theme.border }}
            >
              <p className="text-sm font-medium text-[#2a2723]">{matchSummary(match)}</p>
              <p className="mt-1 text-xs text-gray-500">
                {match.myConsent === true
                  ? "Waiting for the other guest to agree."
                  : "Would you like us to introduce you?"}
              </p>
              {match.myConsent !== true && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={respondingId === match.id}
                    onClick={() => void respondToMatch(match.id, true)}
                    className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
                    style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                  >
                    {respondingId === match.id ? "Saving…" : "Yes, connect us"}
                  </button>
                  <button
                    type="button"
                    disabled={respondingId === match.id}
                    onClick={() => void respondToMatch(match.id, false)}
                    className="rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500"
                    style={{ borderColor: theme.border }}
                  >
                    No thanks
                  </button>
                </div>
              )}
            </div>
          ))}

          {introducedMatches.map((match) => (
            <div
              key={match.id}
              className="rounded-xl border bg-white p-3"
              style={{ borderColor: theme.gold }}
            >
              <p className="text-sm font-medium text-[#2a2723]">{matchSummary(match)}</p>
              <p className="mt-1 text-xs text-emerald-700">
                Introduced — check your email for their contact card.
              </p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">{error}</p>}
      {saved && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
          Transfer details saved — we&apos;ll look for travel buddies if you opted in.
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95 disabled:opacity-60"
        style={{ borderColor: theme.border, color: theme.textDark }}
      >
        {submitting ? "Saving..." : "Save Transfer Details"} <ChevronRight size={14} />
      </button>

    </form>
  );
}
