"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { deriveRsvpFormState } from "@/lib/rsvp-form-defaults";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--wedding-gold)]";

export function RsvpProfileForm() {
  const { profile, loading, error, saveSection, setError } = useGuestProfile();
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState("");
  const [plusOneName, setPlusOneName] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [songRequest, setSongRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const derived = deriveRsvpFormState(profile);
    setPhone(derived.phone);
    setAttending(derived.attending);
    setPlusOneName(derived.plusOneName);
    setDietaryNotes(derived.dietaryNotes);
    setSongRequest(derived.songRequest);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);
    const result = await saveSection("rsvp", {
      phone,
      attending,
      plusOneName,
      dietaryNotes,
      songRequest,
    });
    setSubmitting(false);
    if (result.ok) setSaved(true);
  };

  if (loading) return <p className="text-sm text-gray-400">Loading RSVP…</p>;

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Mobile number"
        className={inputClass}
        style={{ borderColor: theme.border }}
      />
      <div className="grid grid-cols-2 gap-2">
        {(["ACCEPTED", "DECLINED"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAttending(value)}
            className={`rounded-xl border py-3 text-[10px] font-bold uppercase tracking-widest ${
              attending === value ? "text-white" : "bg-white text-[var(--wedding-text-dark)]"
            }`}
            style={{
              borderColor: theme.border,
              backgroundColor: attending === value ? theme.btnDark : undefined,
              color: attending === value ? theme.gold : undefined,
            }}
          >
            {value === "ACCEPTED" ? "Joyfully accept" : "Regretfully decline"}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={plusOneName}
        onChange={(e) => setPlusOneName(e.target.value)}
        placeholder="Plus-one name (if applicable)"
        className={inputClass}
        style={{ borderColor: theme.border }}
      />
      <textarea
        value={dietaryNotes}
        onChange={(e) => setDietaryNotes(e.target.value)}
        placeholder="Dietary requirements"
        rows={2}
        className={inputClass}
        style={{ borderColor: theme.border }}
      />
      <input
        type="text"
        value={songRequest}
        onChange={(e) => setSongRequest(e.target.value)}
        placeholder="Song request"
        className={inputClass}
        style={{ borderColor: theme.border }}
      />
      <button
        type="submit"
        disabled={submitting || !attending}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
        style={{ backgroundColor: theme.btnDark, color: theme.gold }}
      >
        {submitting ? "Saving…" : "Update RSVP"} <ChevronRight size={14} />
      </button>
      {saved && <p className="text-center text-xs text-emerald-600">RSVP updated.</p>}
    </form>
  );
}
