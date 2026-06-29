"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { AccommodationPropertyPicker } from "@/components/wedding/forms/accommodation-property-picker";
import { SPICERS_CLOVELLY } from "@/lib/hinterland-accommodations";
import { BED_PREFERENCE_OPTIONS } from "@/lib/bed-preference";
import { GIFT_COLOUR_OPTIONS } from "@/lib/gift-colour-choices";
import { ARRIVAL_MAX_WAIT_OPTIONS } from "@/lib/transfer-arrival-wait";
import { RETURN_SHUTTLE_AIRPORTS, returnShuttleAirportLabel } from "@/lib/return-shuttle";
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

function CollapsibleSection({
  title,
  submittedAt,
  children,
  defaultOpen = false,
}: {
  title: string;
  submittedAt?: string | null;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border bg-[#faf8f4]" style={{ borderColor: theme.border }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
      >
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#c3a379]">{title}</h4>
          {submittedAt !== undefined &&
            (submittedAt ? (
              <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                Submitted
              </span>
            ) : (
              <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Not submitted
              </span>
            ))}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#c3a379] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t px-3 pb-3 pt-1" style={{ borderColor: theme.border }}>
          {children}
        </div>
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

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-10`}
        style={{ borderColor: theme.border }}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((open) => !open)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-[#2a2723]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function AdminGuestEditor({ guest, onUpdated, onError }: AdminGuestEditorProps) {
  const [password, setPassword] = useState("");
  const [showStoredPassword, setShowStoredPassword] = useState(false);
  const [passwordState, setPasswordState] = useState<SectionState>(defaultSectionState);

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
    bedPreference: guest.bedPreference ?? "",
  });

  const [transfer, setTransfer] = useState({
    wantsSharedTransfer: guest.wantsSharedTransfer ?? false,
    shareTransferContactDetails: guest.shareTransferContactDetails ?? false,
    arrivalAirport: guest.arrivalAirport ?? "",
    arrivalDate: guest.arrivalDate ?? "",
    arrivalTime: guest.arrivalTime ?? "",
    arrivalMaxWait: guest.arrivalMaxWait ?? "",
    departureAirport: guest.departureAirport ?? "",
    departureDate: guest.departureDate ?? "",
    departureTime: guest.departureTime ?? "",
    flightNumber: guest.flightNumber ?? "",
    passengerCount: guest.passengerCount?.toString() ?? "",
    transferNotes: guest.transferNotes ?? "",
    returnShuttleInterest: guest.returnShuttleInterest ?? false,
    returnShuttleAirport: guest.returnShuttleAirport ?? "",
  });

  const [interests, setInterests] = useState({
    glowUpInterest: guest.glowUpInterest ?? "",
    onSiteServiceInterest: guest.onSiteServiceInterest ?? "",
  });

  const [giftColours, setGiftColours] = useState({
    giftColourChoice1: guest.giftColourChoice1 ?? "",
    giftColourChoice2: guest.giftColourChoice2 ?? "",
  });

  const [rsvpState, setRsvpState] = useState<SectionState>(defaultSectionState);
  const [accommodationState, setAccommodationState] = useState<SectionState>(defaultSectionState);
  const [transferState, setTransferState] = useState<SectionState>(defaultSectionState);
  const [interestsState, setInterestsState] = useState<SectionState>(defaultSectionState);
  const [giftColoursState, setGiftColoursState] = useState<SectionState>(defaultSectionState);

  useEffect(() => {
    setPassword("");
    setShowStoredPassword(false);
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
      bedPreference: guest.bedPreference ?? "",
    });
    setTransfer({
      wantsSharedTransfer: guest.wantsSharedTransfer ?? false,
      shareTransferContactDetails: guest.shareTransferContactDetails ?? false,
      arrivalAirport: guest.arrivalAirport ?? "",
      arrivalDate: guest.arrivalDate ?? "",
      arrivalTime: guest.arrivalTime ?? "",
      arrivalMaxWait: guest.arrivalMaxWait ?? "",
      departureAirport: guest.departureAirport ?? "",
      departureDate: guest.departureDate ?? "",
      departureTime: guest.departureTime ?? "",
      flightNumber: guest.flightNumber ?? "",
      passengerCount: guest.passengerCount?.toString() ?? "",
      transferNotes: guest.transferNotes ?? "",
      returnShuttleInterest: guest.returnShuttleInterest ?? false,
      returnShuttleAirport: guest.returnShuttleAirport ?? "",
    });
    setInterests({
      glowUpInterest: guest.glowUpInterest ?? "",
      onSiteServiceInterest: guest.onSiteServiceInterest ?? "",
    });
    setGiftColours({
      giftColourChoice1: guest.giftColourChoice1 ?? "",
      giftColourChoice2: guest.giftColourChoice2 ?? "",
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

  const savePassword = async (nextPassword: string, reset = false) => {
    setPasswordState({ saving: true, saved: false, error: "" });

    const res = await fetch(`/api/admin/guests/${guest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        reset ? { resetPassword: true, password: nextPassword || undefined } : { password: nextPassword },
      ),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data.error ?? "Failed to update password.";
      setPasswordState({ saving: false, saved: false, error: message });
      onError(message);
      return;
    }

    onUpdated({ ...guest, ...data.guest, isAdmin: guest.isAdmin });
    if (data.passwordPlaintext) {
      setPassword(data.passwordPlaintext);
    }
    setPasswordState({ saving: false, saved: true, error: "" });
  };

  const fieldStyle = { borderColor: theme.border };

  return (
    <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: theme.border }}>
      <CollapsibleSection title="Account & Password" defaultOpen>
        <div className="space-y-2">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Current password
            </p>
            {guest.passwordPlaintext ? (
              <div className="relative">
                <p
                  className="rounded-lg border bg-white px-3 py-2 pr-10 font-mono text-sm text-[#2a2723]"
                  style={fieldStyle}
                >
                  {showStoredPassword ? guest.passwordPlaintext : "••••••••••••"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowStoredPassword((open) => !open)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-[#2a2723]"
                  aria-label={showStoredPassword ? "Hide password" : "Show password"}
                >
                  {showStoredPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            ) : (
              <p className="text-xs italic text-gray-500">
                Not signed up yet — password will appear here after they create an account in the app.
              </p>
            )}
          </div>
          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder="New password (min 8 characters)"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={passwordState.saving || password.trim().length < 8}
              onClick={() => void savePassword(password.trim())}
              className="rounded-lg py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              {passwordState.saving ? "Saving..." : passwordState.saved ? "Saved" : "Set Password"}
            </button>
            <button
              type="button"
              disabled={passwordState.saving}
              onClick={() => void savePassword("", true)}
              className="rounded-lg border py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
              style={{ borderColor: theme.border, color: theme.textDark }}
            >
              Generate Random
            </button>
          </div>
          {passwordState.error && <p className="text-[10px] text-red-500">{passwordState.error}</p>}
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Wedding party role
            </p>
            <select
              value={guest.partyRole ?? ""}
              onChange={async (e) => {
                const partyRole = e.target.value === "BEST_BITCH" ? "BEST_BITCH" : null;
                const res = await fetch(`/api/admin/guests/${guest.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ partyRole }),
                });
                const data = await res.json();
                if (!res.ok) {
                  onError(data.error ?? "Failed to update party role.");
                  return;
                }
                onUpdated({ ...guest, ...data.guest, isAdmin: guest.isAdmin });
              }}
              className={inputClass}
              style={fieldStyle}
            >
              <option value="">None</option>
              <option value="BEST_BITCH">Best Bitch (vendor access 5 days before)</option>
            </select>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              MC profile
            </p>
            <label className="flex items-center gap-2 text-xs text-[#2a2723]">
              <input
                type="checkbox"
                checked={guest.isMc}
                onChange={async (e) => {
                  const isMc = e.target.checked;
                  const res = await fetch(`/api/admin/guests/${guest.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isMc }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    onError(data.error ?? "Failed to update MC profile.");
                    return;
                  }
                  onUpdated({ ...guest, ...data.guest, isAdmin: guest.isAdmin });
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              Wedding MC (can verify Photobooth Bingo winners)
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {(guest.sayiImportedAt || guest.sayiPartyName) && (
        <CollapsibleSection title="Sayi.do import" submittedAt={guest.sayiImportedAt}>
          <dl className="space-y-2 text-xs text-[#2a2723]">
            {guest.sayiPartyName && (
              <div>
                <dt className="font-bold uppercase tracking-wider text-gray-400">Party</dt>
                <dd>{guest.sayiPartyName}</dd>
              </div>
            )}
            {guest.mailingAddress && (
              <div>
                <dt className="font-bold uppercase tracking-wider text-gray-400">Mailing address</dt>
                <dd>{guest.mailingAddress}</dd>
              </div>
            )}
            {guest.sayiPlusOneAllowed !== null && (
              <div>
                <dt className="font-bold uppercase tracking-wider text-gray-400">Plus one allowed</dt>
                <dd>{guest.sayiPlusOneAllowed ? "Yes" : "No"}</dd>
              </div>
            )}
            {guest.sayiLink && (
              <div>
                <dt className="font-bold uppercase tracking-wider text-gray-400">Sayi RSVP link</dt>
                <dd>
                  <a href={guest.sayiLink} target="_blank" rel="noreferrer" className="text-[#c3a379] underline">
                    {guest.sayiLink}
                  </a>
                </dd>
              </div>
            )}
            {guest.sayiCustomData && Object.keys(guest.sayiCustomData).length > 0 && (
              <div>
                <dt className="mb-1 font-bold uppercase tracking-wider text-gray-400">Extra Sayi fields</dt>
                <dd className="space-y-1">
                  {Object.entries(guest.sayiCustomData).map(([key, value]) => (
                    <p key={key}>
                      <span className="text-gray-500">{key}:</span> {value}
                    </p>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="RSVP" submittedAt={guest.rsvpSubmittedAt}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection("rsvp", rsvp, setRsvpState);
          }}
        >
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
      </CollapsibleSection>

      <CollapsibleSection title="Accommodation" submittedAt={guest.accommodationSubmittedAt}>
        {guest.assignedRoomName && (
          <div
            className="mb-4 rounded-xl border bg-[#f7f4ee] p-3 text-sm text-[#2a2723]"
            style={{ borderColor: theme.border }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">Assigned room</p>
            <p className="mt-1 font-semibold">{guest.assignedRoomName}</p>
            {guest.assignedRoomConfiguration && (
              <p className="text-xs text-gray-600">{guest.assignedRoomConfiguration} bed</p>
            )}
            {guest.assignedRoomDetails && (
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-gray-600">
                {guest.assignedRoomDetails}
              </p>
            )}
            {(guest.assignedRoomCheckIn || guest.assignedRoomCheckOut) && (
              <p className="mt-2 text-xs text-gray-500">
                {guest.assignedRoomCheckIn && `Check-in ${guest.assignedRoomCheckIn}`}
                {guest.assignedRoomCheckIn && guest.assignedRoomCheckOut && " · "}
                {guest.assignedRoomCheckOut && `Check-out ${guest.assignedRoomCheckOut}`}
              </p>
            )}
            {guest.roomAllocationImportedAt && (
              <p className="mt-2 text-[10px] text-gray-400">
                Imported {new Date(guest.roomAllocationImportedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection("accommodation", accommodation, setAccommodationState);
          }}
        >
          <div className="space-y-2">
            <select
              value={accommodation.accommodationType}
              onChange={(e) => {
                const nextType = e.target.value;
                setAccommodation((current) => ({
                  ...current,
                  accommodationType: nextType,
                  ...(nextType === "ON_SITE"
                    ? {
                        accommodationName: SPICERS_CLOVELLY.name,
                        accommodationAddress: SPICERS_CLOVELLY.address,
                      }
                    : { bedPreference: "" }),
                }));
              }}
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
            <AccommodationPropertyPicker
              accommodationType={accommodation.accommodationType}
              name={accommodation.accommodationName}
              address={accommodation.accommodationAddress}
              onNameChange={(value) =>
                setAccommodation({ ...accommodation, accommodationName: value })
              }
              onAddressChange={(value) =>
                setAccommodation({ ...accommodation, accommodationAddress: value })
              }
            />
            {accommodation.accommodationType === "ON_SITE" && (
              <select
                value={accommodation.bedPreference}
                onChange={(e) =>
                  setAccommodation({ ...accommodation, bedPreference: e.target.value })
                }
                className={inputClass}
                style={fieldStyle}
              >
                <option value="">Bed preference (optional)</option>
                {BED_PREFERENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
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
          <SaveButton
            saving={accommodationState.saving}
            saved={accommodationState.saved}
            label="Save Accommodation"
          />
        </form>
      </CollapsibleSection>

      <CollapsibleSection title="Shared Transfer" submittedAt={guest.transferSubmittedAt}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection(
              "transfer",
              {
                ...transfer,
                passengerCount: transfer.passengerCount ? Number(transfer.passengerCount) : null,
                returnShuttleAirport: transfer.returnShuttleInterest
                  ? transfer.returnShuttleAirport
                  : null,
              },
              setTransferState,
            );
          }}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={transfer.wantsSharedTransfer}
                onChange={(e) => setTransfer({ ...transfer, wantsSharedTransfer: e.target.checked })}
              />
              Interested in shared airport transport
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={transfer.shareTransferContactDetails}
                onChange={(e) =>
                  setTransfer({ ...transfer, shareTransferContactDetails: e.target.checked })
                }
              />
              Consented to travel buddy contact sharing
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
            <select
              value={transfer.arrivalMaxWait}
              onChange={(e) => setTransfer({ ...transfer, arrivalMaxWait: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            >
              <option value="">Max wait after arrival</option>
              {ARRIVAL_MAX_WAIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={transfer.returnShuttleInterest}
                onChange={(e) =>
                  setTransfer({
                    ...transfer,
                    returnShuttleInterest: e.target.checked,
                    returnShuttleAirport: e.target.checked ? transfer.returnShuttleAirport : "",
                  })
                }
              />
              Return shuttle interest (27 Oct, 11:00 am)
            </label>
            {transfer.returnShuttleInterest && (
              <select
                value={transfer.returnShuttleAirport}
                onChange={(e) => setTransfer({ ...transfer, returnShuttleAirport: e.target.value })}
                className={inputClass}
                style={fieldStyle}
              >
                <option value="">Return shuttle airport</option>
                {RETURN_SHUTTLE_AIRPORTS.map((code) => (
                  <option key={code} value={code}>
                    {returnShuttleAirportLabel(code)}
                  </option>
                ))}
              </select>
            )}
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
      </CollapsibleSection>

      <CollapsibleSection title="Interests" submittedAt={guest.interestsSubmittedAt}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection("interests", interests, setInterestsState);
          }}
        >
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
      </CollapsibleSection>

      <CollapsibleSection title="Gift colours" submittedAt={guest.giftColoursSubmittedAt}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveSection("gift-colours", giftColours, setGiftColoursState);
          }}
        >
          <div className="space-y-2">
            <select
              value={giftColours.giftColourChoice1}
              onChange={(e) => setGiftColours({ ...giftColours, giftColourChoice1: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            >
              <option value="">Colour choice 1</option>
              {GIFT_COLOUR_OPTIONS.map((option) => (
                <option key={option.id} value={option.id} disabled={option.id === giftColours.giftColourChoice2}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={giftColours.giftColourChoice2}
              onChange={(e) => setGiftColours({ ...giftColours, giftColourChoice2: e.target.value })}
              className={inputClass}
              style={fieldStyle}
            >
              <option value="">Colour choice 2</option>
              {GIFT_COLOUR_OPTIONS.map((option) => (
                <option key={option.id} value={option.id} disabled={option.id === giftColours.giftColourChoice1}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {giftColoursState.error && <p className="mt-2 text-[10px] text-red-500">{giftColoursState.error}</p>}
          <SaveButton saving={giftColoursState.saving} saved={giftColoursState.saved} label="Save Colours" />
        </form>
      </CollapsibleSection>
    </div>
  );
}
