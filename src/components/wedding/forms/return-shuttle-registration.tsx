"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { ImageLightbox } from "@/components/wedding/shared/image-lightbox";
import {
  RETURN_SHUTTLE,
  RETURN_SHUTTLE_AIRPORTS,
  RETURN_SHUTTLE_AIRPORT_DETAILS,
  returnShuttleFlyerSrc,
  returnShuttleOptionLabel,
} from "@/lib/return-shuttle";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

type ReturnShuttleRegistrationPanelProps = {
  returnShuttleInterest: boolean;
  returnShuttleAirport: string;
  onInterestChange: (interest: boolean, airport: string) => void;
};

export function ReturnShuttleRegistrationPanel({
  returnShuttleInterest,
  returnShuttleAirport,
  onInterestChange,
}: ReturnShuttleRegistrationPanelProps) {
  const [flyerOpen, setFlyerOpen] = useState(false);

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: theme.border }}
      >
        <button
          type="button"
          onClick={() => setFlyerOpen(true)}
          className="block w-full cursor-zoom-in"
          aria-label="View Airport Express departure bus flyer full screen"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={returnShuttleFlyerSrc()}
            alt={`Airport Express — departure coach from Spicers to BNE and MCY on ${RETURN_SHUTTLE.displayDate}`}
            className="h-auto w-full"
            draggable={false}
          />
        </button>
        <div className="space-y-3 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
              {RETURN_SHUTTLE.title} · Departure bus
            </p>
            <p className="mt-2 text-sm text-gray-600">{RETURN_SHUTTLE.description}</p>
          </div>

          <ul className="space-y-2 text-sm text-gray-600">
            {RETURN_SHUTTLE_AIRPORTS.map((code) => {
              const details = RETURN_SHUTTLE_AIRPORT_DETAILS[code];
              return (
                <li
                  key={code}
                  className="rounded-xl border bg-[#faf8f4] px-4 py-3"
                  style={{ borderColor: theme.border }}
                >
                  <strong className="text-[#2a2723]">{code}</strong> — leaves Spicers at{" "}
                  {details.departureTime} ({details.priceGuide})
                </li>
              );
            })}
          </ul>

          <label
            className="flex items-start gap-3 rounded-xl border bg-[#faf8f4] px-4 py-3.5 text-sm text-gray-600"
            style={{ borderColor: theme.border }}
          >
            <input
              type="checkbox"
              checked={returnShuttleInterest}
              onChange={(e) => {
                onInterestChange(e.target.checked, e.target.checked ? returnShuttleAirport : "");
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
            />
            <span>Register my interest for the departure coach on {RETURN_SHUTTLE.displayDate}</span>
          </label>

          {returnShuttleInterest && (
            <select
              value={returnShuttleAirport}
              onChange={(e) => onInterestChange(true, e.target.value)}
              className={inputClass}
              style={{ borderColor: theme.border }}
              required
            >
              <option value="">Which airport are you flying from?</option>
              {RETURN_SHUTTLE_AIRPORTS.map((code) => (
                <option key={code} value={code}>
                  {returnShuttleOptionLabel(code)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <ImageLightbox
        open={flyerOpen}
        src={returnShuttleFlyerSrc()}
        alt="Airport Express departure bus flyer"
        onClose={() => setFlyerOpen(false)}
      />
    </>
  );
}

export function ReturnShuttleRegistrationForm() {
  const { profile, loading, error, saveSection, setError } = useGuestProfile();
  const [returnShuttleInterest, setReturnShuttleInterest] = useState(false);
  const [returnShuttleAirport, setReturnShuttleAirport] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setReturnShuttleInterest(profile.returnShuttleInterest ?? false);
    setReturnShuttleAirport(profile.returnShuttleAirport ?? "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError("");
    setSaved(false);
    setSubmitting(true);

    const result = await saveSection("transfer", {
      wantsSharedTransfer: profile.wantsSharedTransfer ?? false,
      shareTransferContactDetails: profile.shareTransferContactDetails ?? false,
      arrivalAirport: profile.arrivalAirport ?? "",
      arrivalDate: profile.arrivalDate ?? "",
      arrivalTime: profile.arrivalTime ?? "",
      arrivalMaxWait: profile.arrivalMaxWait ?? null,
      departureAirport: profile.departureAirport ?? "",
      departureDate: profile.departureDate ?? "",
      departureTime: profile.departureTime ?? "",
      flightNumber: profile.flightNumber ?? "",
      passengerCount: profile.passengerCount ?? null,
      transferNotes: profile.transferNotes ?? "",
      returnShuttleInterest,
      returnShuttleAirport: returnShuttleInterest ? returnShuttleAirport : null,
    });

    setSubmitting(false);
    if (result.ok) setSaved(true);
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading your details…</p>;
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <ReturnShuttleRegistrationPanel
        returnShuttleInterest={returnShuttleInterest}
        returnShuttleAirport={returnShuttleAirport}
        onInterestChange={(interest, airport) => {
          setReturnShuttleInterest(interest);
          setReturnShuttleAirport(airport);
          setSaved(false);
        }}
      />

      {error && <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">{error}</p>}
      {saved && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
          Departure transport saved — we&apos;ll be in touch with coach details.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95 disabled:opacity-60"
        style={{ borderColor: theme.border, color: theme.textDark }}
      >
        {submitting ? "Saving…" : "Save Registration"} <ChevronRight size={14} />
      </button>
    </form>
  );
}
