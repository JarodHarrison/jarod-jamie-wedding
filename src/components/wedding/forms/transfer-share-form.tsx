"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

export function TransferShareForm() {
  const { profile, loading, error, saveSection, setError } = useGuestProfile();
  const [wantsSharedTransfer, setWantsSharedTransfer] = useState(true);
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [passengerCount, setPassengerCount] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setWantsSharedTransfer(profile.wantsSharedTransfer ?? true);
    setArrivalAirport(profile.arrivalAirport ?? "");
    setArrivalDate(profile.arrivalDate ?? "");
    setArrivalTime(profile.arrivalTime ?? "");
    setDepartureAirport(profile.departureAirport ?? "");
    setDepartureDate(profile.departureDate ?? "");
    setDepartureTime(profile.departureTime ?? "");
    setFlightNumber(profile.flightNumber ?? "");
    setPassengerCount(profile.passengerCount?.toString() ?? "");
    setTransferNotes(profile.transferNotes ?? "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);

    const result = await saveSection("transfer", {
      wantsSharedTransfer,
      arrivalAirport,
      arrivalDate,
      arrivalTime,
      departureAirport,
      departureDate,
      departureTime,
      flightNumber,
      passengerCount: passengerCount ? Number(passengerCount) : null,
      transferNotes,
    });

    setSubmitting(false);
    if (result.ok) setSaved(true);
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading your details...</p>;
  }

  return (
    <form id="shared-transfer-form" onSubmit={handleSubmit} className="space-y-3">
      <label className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-600" style={{ borderColor: theme.border }}>
        <input
          type="checkbox"
          checked={wantsSharedTransfer}
          onChange={(e) => setWantsSharedTransfer(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        I&apos;m interested in sharing airport transport
      </label>
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
      {error && <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">{error}</p>}
      {saved && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
          Transfer details saved — we&apos;ll be in touch!
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
