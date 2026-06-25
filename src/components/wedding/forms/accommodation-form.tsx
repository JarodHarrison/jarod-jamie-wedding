"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { AccommodationPropertyPicker } from "@/components/wedding/forms/accommodation-property-picker";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import {
  BED_PREFERENCE_OPTIONS,
  guestShowsBedPreference,
  type BedPreference,
} from "@/lib/bed-preference";
import { SPICERS_CLOVELLY } from "@/lib/hinterland-accommodations";
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
  const [bedPreference, setBedPreference] = useState<BedPreference | "">("");
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
    setBedPreference(
      profile.bedPreference === "KING" || profile.bedPreference === "TWIN"
        ? profile.bedPreference
        : "",
    );
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
      bedPreference: bedPreference || null,
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

  const showBedPreference = profile
    ? guestShowsBedPreference({
        accommodationType: accommodationType || profile.accommodationType,
        tier: profile.tier,
        assignedRoomName: profile.assignedRoomName,
      })
    : false;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <select
          value={accommodationType}
          onChange={(e) => {
            const nextType = e.target.value;
            setAccommodationType(nextType);
            if (nextType === "ON_SITE") {
              setAccommodationName(SPICERS_CLOVELLY.name);
              setAccommodationAddress(SPICERS_CLOVELLY.address);
            } else {
              setBedPreference("");
            }
          }}
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
      <AccommodationPropertyPicker
        accommodationType={accommodationType}
        name={accommodationName}
        address={accommodationAddress}
        onNameChange={setAccommodationName}
        onAddressChange={setAccommodationAddress}
      />
      {showBedPreference && (
        <div
          className="space-y-3 rounded-xl border bg-white px-4 py-4"
          style={{ borderColor: theme.border }}
        >
          <div>
            <p className="text-sm font-medium text-[#2a2723]">Bed preference</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Let us know how you&apos;d like the room set up at Spicers. Not all rooms can be
              configured both ways — we&apos;ll pass your preference to the estate.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {BED_PREFERENCE_OPTIONS.map((option) => {
              const selected = bedPreference === option.value;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                    selected ? "border-[#c3a379] bg-[#f7f4ee]" : "bg-white"
                  }`}
                  style={{ borderColor: selected ? theme.gold : theme.border }}
                >
                  <input
                    type="radio"
                    name="bedPreference"
                    value={option.value}
                    checked={selected}
                    onChange={() => setBedPreference(option.value)}
                    className="sr-only"
                  />
                  <p className="text-sm font-semibold text-[#2a2723]">{option.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{option.description}</p>
                </label>
              );
            })}
          </div>
        </div>
      )}
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
