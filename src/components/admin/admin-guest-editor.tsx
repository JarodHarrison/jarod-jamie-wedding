"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import type { GuestProfileSection } from "@/lib/guest-profile";
import type { AdminGuest } from "@/types/wedding";

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

type AdminGuestEditorProps = {
  guest: AdminGuest;
  onUpdated: (profile: AdminGuest) => void;
  onError: (message: string) => void;
};

type SectionState = {
  saving: boolean;
  saved: boolean;
  error: string;
};

const defaultSectionState: SectionState = { saving: false, saved: false, error: "" };

function SectionHeader({
  title,
  submittedAt,
}: {
  title: string;
  submittedAt: string | null;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[#c3a379]">{title}</h4>
      {submittedAt ? (
        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
          Submitted
        </span>
      ) : (
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Not submitted
        </span>
      )}
    </div>
  );
}

function SaveButton({
  saving,
  saved,
  label,
}: {
  saving: boolean;
  saved: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="mt-2 w-full rounded-lg py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
      style={{ backgroundColor: theme.btnDark, color: theme.gold }}
    >
      {saving ? "Saving..." : saved ? "Saved" : label}
    </button>
  );
}

export function AdminGuestEditor({ guest, onUpdated, onError }: AdminGuestEditorProps) {
  const [rsvp, setRsvp] = useState({
    attending: guest.rsvpStatus === "PENDING" ? "" : guest.rsvpStatus,
    phone: guest.phone ?? "",
    plusOneName: guest.plusOneName ?? "",
    dietaryNotes: guest.dietaryNotes ?? "",
    songRequest: guest.songRequest ?? "",
  });

  const [accommodation, setAccommodation] = useState({
    accommodationType: guest.accommodationType ?? "",
    accommodationName: guest.accommodationName ?? "",
    accommodationAddress: guest.accommodationAddress ?? "",
    checkInDate: guest.checkInDate ?? "",
    checkOutDate: guest.checkOutDate ?? "",
    needsShuttle: guest.needsShuttle ?? false,
    accommodationNotes: guest.accommodationNotes ?? "",
  });

  const [transfer, setTransfer] = useState({
    wantsSharedTransfer: guest.wantsSharedTransfer ?? false,
    arrivalAirport: guest.arrivalAirport ?? "",
    arrivalDate: guest.arrivalDate ?? "",
    arrivalTime: guest.arrivalTime ?? "",
    departureAirport: guest.departureAirport ?? "",
    departureDate: guest.departureDate ?? "",
    departureTime: guest.departureTime ?? "",
    flightNumber: guest.flightNumber ?? "",
    passengerCount: guest.passengerCount?.toString() ?? "",
    transferNotes: guest.transferNotes ?? "",
  });

  const [interests, setInterests] = useState({
    glowUpInterest: guest.glowUpInterest ?? "",
    onSiteServiceInterest: guest.onSiteServiceInterest ?? "",
  });

  const [rsvpState, setRsvpState] = useState<SectionState>(defaultSectionState);
  const [accommodationState, setAccommodationState] = useState<SectionState>(defaultSectionState);
  const [transferState, setTransferState] = useState<SectionState>(defaultSectionState);
  const [interestsState, setInterestsState] = useState<SectionState>(defaultSectionState);

  useEffect(() => {
    setRsvp({
      attending: guest.rsvpStatus === "PENDING" ? "" : guest.rsvpStatus,
      phone: guest.phone ?? "",
      plusOneName: guest.plusOneName ?? "",
      dietaryNotes: guest.dietaryNotes ?? "",
      songRequest: guest.songRequest ?? "",
    });
    setAccommodation({
      accommodationType: guest.accommodationType ?? "",
      accommodationName: guest.accommodationName ?? "",
      accommodationAddress: guest.accommodationAddress ?? "",
      checkInDate: guest.checkInDate ?? "",
      checkOutDate: guest.checkOutDate ?? "",
      needsShuttle: guest.needsShuttle ?? false,
      accommodationNotes: guest.accommodationNotes ?? "",
    });
    setTransfer({
      wantsSharedTransfer: guest.wantsSharedTransfer ?? false,
      arrivalAirport: guest.arrivalAirport ?? "",
      arrivalDate: guest.arrivalDate ?? "",
      arrivalTime: guest.arrivalTime ?? "",
      departureAirport: guest.departureAirport ?? "",
      departureDate: guest.departureDate ?? "",
      departureTime: guest.departureTime ?? "",
      flightNumber: guest.flightNumber ?? "",
      passengerCount: guest.passengerCount?.toString() ?? "",
      transferNotes: guest.transferNotes ?? "",
    });
    setInterests({
      glowUpInterest: guest.glowUpInterest ?? "",
      onSiteServiceInterest: guest.onSiteServiceInterest ?? "",
    });
  }, [guest]);

  const saveSection = async (
    section: GuestProfileSection,
    payload: Record<string, unknown>,
    setState: React.Dispatch<React.SetStateAction<SectionState>>,
  ) => {
    setState({ saving: true, saved: false, error: "" });

    const res = await fetch(`/api/admin/guests/${guest.id}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, ...payload }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data.error ?? "Failed to save.";
      setState({ saving: false, saved: false, error: message });
      onError(message);
      return;
    }

    onUpdated({ ...guest, ...data.profile, isAdmin: guest.isAdmin });
    setState({ saving: false, saved: true, error: "" });
  };

  const fieldStyle = { borderColor: theme.border };

  return (
    <div className="mt-4 space-y-5 border-t pt-4" style={{ borderColor: theme.border }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void saveSection("rsvp", rsvp, setRsvpState);
        }}
        className="rounded-xl border bg-[#faf8f4] p-3"
        style={{ borderColor: theme.border }}
      >
        <SectionHeader title="RSVP" submittedAt={guest.rsvpSubmittedAt} />
        <div className="space-y-2">
          <select
            value={rsvp.attending}
            onChange={(e) => setRsvp({ ...rsvp, attending: e.target.value })}
            className={inputClass}
            style={fieldStyle}
            required
          >
            <option value="" disabled>
              Attending?
            </option>
            <option value="ACCEPTED">Accepting</option>
            <option value="DECLINED">Declining</option>
          </select>
          <input
            type="tel"
            placeholder="Phone"
            value={rsvp.phone}
            onChange={(e) => setRsvp({ ...rsvp, phone: e.target.value })}
            className={inputClass}
            style={fieldStyle}
          />
          <input
            type="text"
            placeholder="Plus one name"
            value={rsvp.plusOneName}
            onChange={(e) => setRsvp({ ...rsvp, plusOneName: e.target.value })}
            className={inputClass}
            style={fieldStyle}
          />
          <textarea
            placeholder="Dietary requirements"
            rows={2}
            value={rsvp.dietaryNotes}
            onChange={(e) => setRsvp({ ...rsvp, dietaryNotes: e.target.value })}
            className={`${inputClass} resize-none`}
            style={fieldStyle}
          />
          <input
            type="text"
            placeholder="Song request"
            value={rsvp.songRequest}
            onChange={(e) => setRsvp({ ...rsvp, songRequest: e.target.value })}
            className={inputClass}
            style={fieldStyle}
          />
        </div>
        {rsvpState.error && <p className="mt-2 text-[10px] text-red-500">{rsvpState.error}</p>}
        <SaveButton saving={rsvpState.saving} saved={rsvpState.saved} label="Save RSVP" />
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void saveSection("accommodation", accommodation, setAccommodationState);
        }}
        className="rounded-xl border bg-[#faf8f4] p-3"
        style={{ borderColor: theme.border }}
      >
        <SectionHeader title="Accommodation" submittedAt={guest.accommodationSubmittedAt} />
        <div className="space-y-2">
          <select
            value={accommodation.accommodationType}
            onChange={(e) => setAccommodation({ ...accommodation, accommodationType: e.target.value })}
            className={inputClass}
            style={fieldStyle}
            required
          >
            <option value="" disabled>
              Where staying?
            </option>
            <option value="ON_SITE">On-site at Spicers</option>
            <option value="MONTVILLE">Montville area</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="text"
            placeholder="Property name"
            value={accommodation.accommodationName}
            onChange={(e) => setAccommodation({ ...accommodation, accommodationName: e.target.value })}
            className={inputClass}
            style={fieldStyle}
          />
          <input
            type="text"
            placeholder="Address"
            value={accommodation.accommodationAddress}
            onChange={(e) => setAccommodation({ ...accommodation, accommodationAddress: e.target.value })}
            className={inputClass}
            style={fieldStyle}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={accommodation.checkInDate}
              onChange={(e) => setAccommodation({ ...accommodation, checkInDate: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
            <input
              type="date"
              value={accommodation.checkOutDate}
              onChange={(e) => setAccommodation({ ...accommodation, checkOutDate: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={accommodation.needsShuttle}
              onChange={(e) => setAccommodation({ ...accommodation, needsShuttle: e.target.checked })}
            />
            Needs courtesy shuttle
          </label>
          <textarea
            placeholder="Accommodation notes"
            rows={2}
            value={accommodation.accommodationNotes}
            onChange={(e) => setAccommodation({ ...accommodation, accommodationNotes: e.target.value })}
            className={`${inputClass} resize-none`}
            style={fieldStyle}
          />
        </div>
        {accommodationState.error && (
          <p className="mt-2 text-[10px] text-red-500">{accommodationState.error}</p>
        )}
        <SaveButton saving={accommodationState.saving} saved={accommodationState.saved} label="Save Accommodation" />
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void saveSection(
            "transfer",
            {
              ...transfer,
              passengerCount: transfer.passengerCount ? Number(transfer.passengerCount) : null,
            },
            setTransferState,
          );
        }}
        className="rounded-xl border bg-[#faf8f4] p-3"
        style={{ borderColor: theme.border }}
      >
        <SectionHeader title="Shared Transfer" submittedAt={guest.transferSubmittedAt} />
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={transfer.wantsSharedTransfer}
              onChange={(e) => setTransfer({ ...transfer, wantsSharedTransfer: e.target.checked })}
            />
            Interested in shared airport transport
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={transfer.arrivalAirport}
              onChange={(e) => setTransfer({ ...transfer, arrivalAirport: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            >
              <option value="">Arrival airport</option>
              <option value="MCY">Sunshine Coast (MCY)</option>
              <option value="BNE">Brisbane (BNE)</option>
            </select>
            <input
              type="text"
              placeholder="Flight number"
              value={transfer.flightNumber}
              onChange={(e) => setTransfer({ ...transfer, flightNumber: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={transfer.arrivalDate}
              onChange={(e) => setTransfer({ ...transfer, arrivalDate: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
            <input
              type="time"
              value={transfer.arrivalTime}
              onChange={(e) => setTransfer({ ...transfer, arrivalTime: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={transfer.departureAirport}
              onChange={(e) => setTransfer({ ...transfer, departureAirport: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            >
              <option value="">Departure airport</option>
              <option value="MCY">Sunshine Coast (MCY)</option>
              <option value="BNE">Brisbane (BNE)</option>
            </select>
            <input
              type="number"
              min={1}
              placeholder="Passengers"
              value={transfer.passengerCount}
              onChange={(e) => setTransfer({ ...transfer, passengerCount: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={transfer.departureDate}
              onChange={(e) => setTransfer({ ...transfer, departureDate: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
            <input
              type="time"
              value={transfer.departureTime}
              onChange={(e) => setTransfer({ ...transfer, departureTime: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            />
          </div>
          <textarea
            placeholder="Transfer notes"
            rows={2}
            value={transfer.transferNotes}
            onChange={(e) => setTransfer({ ...transfer, transferNotes: e.target.value })}
            className={`${inputClass} resize-none`}
            style={fieldStyle}
          />
        </div>
        {transferState.error && <p className="mt-2 text-[10px] text-red-500">{transferState.error}</p>}
        <SaveButton saving={transferState.saving} saved={transferState.saved} label="Save Transfer" />
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void saveSection("interests", interests, setInterestsState);
        }}
        className="rounded-xl border bg-[#faf8f4] p-3"
        style={{ borderColor: theme.border }}
      >
        <SectionHeader title="Interests" submittedAt={guest.interestsSubmittedAt} />
        <div className="space-y-2">
          <select
            value={interests.glowUpInterest}
            onChange={(e) => setInterests({ ...interests, glowUpInterest: e.target.value })}
            className={inputClass}
            style={fieldStyle}
          >
            <option value="">Glow up — none</option>
            <option value="teeth">Teeth Whitening</option>
            <option value="botox">Botox Pump Party</option>
            <option value="both">Both</option>
          </select>
          <select
            value={interests.onSiteServiceInterest}
            onChange={(e) => setInterests({ ...interests, onSiteServiceInterest: e.target.value })}
            className={inputClass}
            style={fieldStyle}
          >
            <option value="">On-site services — none</option>
            <option value="hair">Hair & Make-up</option>
            <option value="barber">Barber / Fresh Cut</option>
            <option value="both">Both Services</option>
          </select>
        </div>
        {interestsState.error && <p className="mt-2 text-[10px] text-red-500">{interestsState.error}</p>}
        <SaveButton saving={interestsState.saving} saved={interestsState.saved} label="Save Interests" />
      </form>
    </div>
  );
}
