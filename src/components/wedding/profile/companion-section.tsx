"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Heart, Loader2, Search, Trash2, UserRound } from "lucide-react";
import { PROFILE_PHOTO_ACCEPT } from "@/lib/guest-identity";
import { theme } from "@/lib/theme";
import type { GuestProfile } from "@/types/wedding";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--wedding-gold)]";

type SearchGuest = {
  id: string;
  name: string;
  hasProfilePhoto: boolean;
  photoUrl: string | null;
};

type CompanionSectionProps = {
  profile: GuestProfile;
  onProfileChange: (profile: GuestProfile) => void;
  onError: (message: string) => void;
  visionModerationEnabled?: boolean;
};

export function CompanionSection({
  profile,
  onProfileChange,
  onError,
  visionModerationEnabled = false,
}: CompanionSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchGuest[]>([]);
  const [searching, setSearching] = useState(false);
  const [plusOneName, setPlusOneName] = useState(profile.plusOneName ?? "");
  const [linkedGuestId, setLinkedGuestId] = useState(profile.plusOneGuestId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [companionPreview, setCompanionPreview] = useState<string | null>(null);

  const linkedGuest = profile.plusOneGuest;
  const partnerHasOwnProfile = Boolean(linkedGuest?.hasProfilePhoto);
  const showCompanionPhotoUpload = Boolean(
    (linkedGuest && !partnerHasOwnProfile) || (!linkedGuest && (plusOneName || profile.plusOneName)),
  );

  useEffect(() => {
    setPlusOneName(profile.plusOneName ?? "");
    setLinkedGuestId(profile.plusOneGuestId ?? "");
  }, [profile]);

  useEffect(() => {
    if (!profile.hasCompanionPhoto) {
      setCompanionPreview(null);
      return;
    }
    setCompanionPreview(
      `/api/guest/profile/companion-photo?v=${profile.profileUpdatedAt ?? profile.createdAt}`,
    );
  }, [profile]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/guests/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (res.ok) setResults(data.guests ?? []);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  const saveCompanion = async (payload: {
    plusOneGuestId?: string | null;
    plusOneName?: string | null;
  }) => {
    setSaving(true);
    setSaved(false);
    onError("");

    try {
      const res = await fetch("/api/guest/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "companion", ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to save companion details.");
        return;
      }
      onProfileChange(data.profile);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const uploadCompanionPhoto = async (file: File) => {
    setUploadingPhoto(true);
    onError("");
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/guest/profile/companion-photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.rejected) {
        onError(data.message ?? "That photo can't be used for your profile.");
        return;
      }
      if (!res.ok) {
        onError(data.error ?? "Failed to upload photo.");
        return;
      }
      onProfileChange(data.profile);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removeCompanionPhoto = async () => {
    setUploadingPhoto(true);
    onError("");
    try {
      const res = await fetch("/api/guest/profile/companion-photo", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to remove photo.");
        return;
      }
      onProfileChange(data.profile);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const displayName = linkedGuest?.name ?? plusOneName ?? profile.plusOneName;
  const displayPhoto =
    linkedGuest?.photoUrl ??
    companionPreview ??
    null;

  return (
    <div
      className="rounded-3xl border bg-white/70 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        I&apos;m here with…
      </p>

      {displayName ? (
        <div className="mt-4 flex items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-[var(--wedding-bg)]"
            style={{ borderColor: theme.gold }}
          >
            {displayPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayPhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound size={28} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-serif text-xl text-[#2a2723]">{displayName}</p>
            {linkedGuest ? (
              <p className="text-xs text-emerald-700">
                {partnerHasOwnProfile ? "Linked guest profile" : "Linked — waiting on their photo"}
              </p>
            ) : (
              <p className="text-xs text-gray-500">Name saved — they can claim their profile later</p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          Link your plus-one if they&apos;re on the guest list, or add their name below.
        </p>
      )}

      <div className="mt-5 space-y-3">
        <label className="block text-xs font-medium text-gray-600">
          Search guest list
          <div className="relative mt-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing their name…"
              className={`${inputClass} pl-10`}
              style={{ borderColor: theme.border }}
            />
          </div>
        </label>

        {searching && <p className="text-xs text-gray-400">Searching…</p>}

        {results.length > 0 && (
          <ul className="space-y-2 rounded-xl border bg-white p-2" style={{ borderColor: theme.border }}>
            {results.map((guest) => (
              <li key={guest.id}>
                <button
                  type="button"
                  onClick={() => {
                    setLinkedGuestId(guest.id);
                    setPlusOneName("");
                    setQuery("");
                    setResults([]);
                    void saveCompanion({ plusOneGuestId: guest.id, plusOneName: null });
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#f7f4ee]"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#f7f4ee]">
                    {guest.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={guest.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Heart size={16} className="text-[#c3a379]" />
                    )}
                  </div>
                  <span className="text-sm text-[#2a2723]">{guest.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="block text-xs font-medium text-gray-600">
          Or enter their name
          <input
            type="text"
            value={plusOneName}
            onChange={(e) => {
              setPlusOneName(e.target.value);
              setLinkedGuestId("");
            }}
            placeholder="Plus-one name"
            className={`${inputClass} mt-1`}
            style={{ borderColor: theme.border }}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || (!plusOneName && !linkedGuestId)}
            onClick={() =>
              void saveCompanion({
                plusOneGuestId: linkedGuestId || null,
                plusOneName: linkedGuestId ? null : plusOneName || null,
              })
            }
            className="rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {(linkedGuestId || profile.plusOneGuestId || profile.plusOneName) && (
            <button
              type="button"
              onClick={() => {
                setLinkedGuestId("");
                setPlusOneName("");
                void saveCompanion({ plusOneGuestId: null, plusOneName: null });
              }}
              className="rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500"
              style={{ borderColor: theme.border }}
            >
              Clear
            </button>
          )}
        </div>

        {saved && <p className="text-xs text-emerald-600">Companion details saved.</p>}
      </div>

      {showCompanionPhotoUpload && (
        <div className="mt-5 border-t pt-5" style={{ borderColor: theme.border }}>
          <p className="text-xs text-gray-500">
            {linkedGuest && !partnerHasOwnProfile
              ? `${linkedGuest.name} hasn't uploaded a photo yet — you can add one for the guest wall.`
              : "Add a photo of your plus-one for the guest wall until they sign up."}
            {visionModerationEnabled ? " Only clearly unsafe images are blocked." : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              {uploadingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              {profile.hasCompanionPhoto ? "Change their photo" : "Add their photo"}
            </button>
            {profile.hasCompanionPhoto && (
              <button
                type="button"
                onClick={() => void removeCompanionPhoto()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500"
                style={{ borderColor: theme.border }}
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={PROFILE_PHOTO_ACCEPT}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void uploadCompanionPhoto(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
