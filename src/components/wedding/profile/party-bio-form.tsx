"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";
import type { GuestProfile } from "@/types/wedding";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--wedding-gold)]";

type PartyBioFormProps = {
  profile: GuestProfile;
  onProfileChange: (profile: GuestProfile) => void;
  onError: (message: string) => void;
};

export function PartyBioForm({ profile, onProfileChange, onError }: PartyBioFormProps) {
  const [partyBio, setPartyBio] = useState(profile.partyBio ?? "");
  const [dietaryNotes, setDietaryNotes] = useState(profile.dietaryNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPartyBio(profile.partyBio ?? "");
    setDietaryNotes(profile.dietaryNotes ?? "");
  }, [profile.partyBio, profile.dietaryNotes]);

  const roleLabel = [
    profile.isCelebrant ? "Celebrant" : null,
    profile.isMc ? "MC" : null,
  ]
    .filter(Boolean)
    .join(" & ");

  async function save() {
    setSaving(true);
    onError("");
    setSaved(false);
    try {
      const res = await fetch("/api/guest/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "party-bio",
          partyBio,
          dietaryNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to save party profile.");
        return;
      }
      onProfileChange(data.profile);
      setSaved(true);
    } catch {
      onError("Failed to save party profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        As our {roleLabel || "wedding party host"}, add a short bio for the Party page and any dietary
        needs so we can arrange the right vendor meal for you.
      </p>

      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Dietary requirements (vendor meal)
        </span>
        <textarea
          value={dietaryNotes}
          onChange={(e) => setDietaryNotes(e.target.value)}
          rows={3}
          placeholder="e.g. vegetarian, gluten-free, no shellfish…"
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Party page bio
        </span>
        <textarea
          value={partyBio}
          onChange={(e) => setPartyBio(e.target.value)}
          rows={5}
          maxLength={800}
          placeholder="A short intro guests can read when they tap your photo…"
          className={inputClass}
          style={{ borderColor: theme.border }}
        />
        <span className="mt-1 block text-right text-[10px] text-gray-400">{partyBio.length}/800</span>
      </label>

      <p className="text-xs text-gray-500">
        Use My Profile photo above if you&apos;d like your picture on the Party page.
      </p>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="w-full rounded-full py-3 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-60"
        style={{ backgroundColor: theme.btnDark }}
      >
        {saving ? "Saving…" : "Save party profile"}
      </button>
      {saved && <p className="text-center text-xs text-emerald-700">Saved. Thank you!</p>}
    </div>
  );
}
