"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

export function RSVPScreen() {
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
    setPhone(profile.phone ?? "");
    setAttending(profile.rsvpStatus === "PENDING" ? "" : profile.rsvpStatus);
    setPlusOneName(profile.plusOneName ?? "");
    setDietaryNotes(profile.dietaryNotes ?? "");
    setSongRequest(profile.songRequest ?? "");
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-8 wedding-screen-top">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in wedding-screen-top px-8 pb-10">
      <div className="mb-10 text-center">
        <h2 className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500">
          You&apos;re Invited
        </h2>
        <h1 className="mb-4 font-serif text-4xl text-[#2a2723]">RSVP</h1>
        <p
          className="rounded-xl border bg-white/50 p-3 text-sm font-light text-gray-600"
          style={{ borderColor: theme.border }}
        >
          We are accepting late RSVPs as we still have some space left!
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div
          className="space-y-4 rounded-2xl border bg-white/40 p-5 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <input
            type="text"
            value={profile?.name ?? ""}
            readOnly
            className={`${inputClass} bg-[#f7f4ee] text-gray-500`}
            style={{ borderColor: theme.border }}
          />
          <input
            type="email"
            value={profile?.email ?? ""}
            readOnly
            className={`${inputClass} bg-[#f7f4ee] text-gray-500`}
            style={{ borderColor: theme.border }}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            style={{ borderColor: theme.border }}
          />
          <div className="relative">
            <select
              value={attending}
              onChange={(e) => setAttending(e.target.value)}
              className={`${inputClass} appearance-none`}
              style={{ borderColor: theme.border }}
              required
            >
              <option value="" disabled>
                Will you be attending?
              </option>
              <option value="ACCEPTED">Joyfully Accept</option>
              <option value="DECLINED">Regretfully Decline</option>
            </select>
            <ChevronRight
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 rotate-90 -translate-y-1/2 text-gray-400"
            />
          </div>
          <input
            type="text"
            placeholder="Bringing a Plus One? (Name)"
            value={plusOneName}
            onChange={(e) => setPlusOneName(e.target.value)}
            className={inputClass}
            style={{ borderColor: theme.border }}
          />
          <textarea
            placeholder="Dietary Requirements or Notes"
            rows={2}
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            className={`${inputClass} resize-none`}
            style={{ borderColor: theme.border }}
          />
          <input
            type="text"
            placeholder="I promise to dance if you play..."
            value={songRequest}
            onChange={(e) => setSongRequest(e.target.value)}
            className={inputClass}
            style={{ borderColor: theme.border }}
          />
        </div>

        {error && (
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-red-500">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
            RSVP saved — thank you!
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-widest shadow-lg transition-transform active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          {submitting ? "Saving..." : "Submit RSVP"} <ChevronRight size={14} />
        </button>

        <div className="mt-8 space-y-4 border-t pt-6 text-center" style={{ borderColor: theme.border }}>
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <p className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase leading-relaxed tracking-widest text-[#2a2723]">
              <span className="mb-1 rounded-md bg-rose-200 px-2 py-1 text-rose-800">Important Note</span>
              Children will not be allowed at the reception dinner. A professional nanny will be available on site.
            </p>
          </div>
          <p className="text-[9px] italic leading-relaxed text-gray-400">
            By submitting, you agree to receive wedding updates via email & SMS.
          </p>
        </div>
      </form>
    </div>
  );
}
