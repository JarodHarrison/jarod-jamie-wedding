"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

export function AccommodationForm() {
  const { profile, loading, error, saveSection, setError } = useGuestProfile();
  const [accommodationType, setAccommodationType] = useState("");
  const [accommodationName, setAccommodationName] = useState("");
  const [accommodationAddress, setAccommodationAddress] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [needsShuttle, setNeedsShuttle] = useState(false);
  const [accommodationNotes, setAccommodationNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [onSiteUnlocked, setOnSiteUnlocked] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAccommodationType(profile.accommodationType ?? "");
    setAccommodationName(profile.accommodationName ?? "");
    setAccommodationAddress(profile.accommodationAddress ?? "");
    setCheckInDate(profile.checkInDate ?? "");
    setCheckOutDate(profile.checkOutDate ?? "");
    setNeedsShuttle(profile.needsShuttle ?? false);
    setAccommodationNotes(profile.accommodationNotes ?? "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);

    const result = await saveSection("accommodation", {
      accommodationType,
      accommodationName,
      accommodationAddress,
      checkInDate,
      checkOutDate,
      needsShuttle,
      accommodationNotes,
    });

    setSubmitting(false);
    if (result.ok) {
      setSaved(true);
      if (result.tierUpdated) {
        setOnSiteUnlocked(true);
      }
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading your details...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <select
          value={accommodationType}
          onChange={(e) => setAccommodationType(e.target.value)}
          className={`${inputClass} appearance-none`}
          style={{ borderColor: theme.border }}
          required
        >
          <option value="" disabled>
            Where are you staying?
          </option>
          <option value="ON_SITE">On-site at Spicers Clovelly Estate</option>
          <option value="MONTVILLE">Montville area accommodation</option>
          <option value="OTHER">Other / outside shuttle route</option>
        </select>
        <ChevronRight
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 rotate-90 -translate-y-1/2 text-gray-400"
        />
      </div>
      <input
        type="text"
        placeholder="Property or hotel name"
        value={accommodationName}
        onChange={(e) => setAccommodationName(e.target.value)}
        className={inputClass}
        style={{ borderColor: theme.border }}
      />
      <input
        type="text"
        placeholder="Address"
        value={accommodationAddress}
        onChange={(e) => setAccommodationAddress(e.target.value)}
        className={inputClass}
        style={{ borderColor: theme.border }}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
        <input
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
      </div>
      <label className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-600" style={{ borderColor: theme.border }}>
        <input
          type="checkbox"
          checked={needsShuttle}
          onChange={(e) => setNeedsShuttle(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        I need the courtesy shuttle
      </label>
      <textarea
        placeholder="Any notes for shuttle planning?"
        rows={2}
        value={accommodationNotes}
        onChange={(e) => setAccommodationNotes(e.target.value)}
        className={`${inputClass} resize-none`}
        style={{ borderColor: theme.border }}
      />
      {error && <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">{error}</p>}
      {saved && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
          Accommodation preferences saved!
        </p>
      )}
      {onSiteUnlocked && (
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-wider text-[#2a2723]">
          On-site access unlocked — Friday&apos;s lakeside welcome is now in your itinerary.
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-md transition-transform active:scale-95 disabled:opacity-60"
        style={{ backgroundColor: theme.gold, color: theme.btnDark }}
      >
        {submitting ? "Saving..." : "Save Preferences"} <ChevronRight size={14} />
      </button>
    </form>
  );
}
