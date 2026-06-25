"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import {
  GUEST_OF_HOST_OPTIONS,
  GUEST_RELATIONSHIP_OPTIONS,
  PROFILE_PHOTO_ACCEPT,
} from "@/lib/guest-identity";
import { theme } from "@/lib/theme";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";
import type { GuestProfile } from "@/types/wedding";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--wedding-gold)]";

type ProfilePhotoSectionProps = {
  profile: GuestProfile;
  onProfileChange: (profile: GuestProfile) => void;
  onError: (message: string) => void;
};

export function ProfilePhotoSection({ profile, onProfileChange, onError }: ProfilePhotoSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [guestOfHost, setGuestOfHost] = useState("");
  const [guestRelationship, setGuestRelationship] = useState("");
  const [guestRelationshipNote, setGuestRelationshipNote] = useState("");
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [identitySaved, setIdentitySaved] = useState(false);

  useEffect(() => {
    setGuestOfHost(profile.guestOfHost ?? "");
    setGuestRelationship(profile.guestRelationship ?? "");
    setGuestRelationshipNote(profile.guestRelationshipNote ?? "");
  }, [profile]);

  useEffect(() => {
    if (!profile.hasProfilePhoto) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(`/api/guest/profile/photo?v=${profile.profileUpdatedAt ?? profile.createdAt}`);
  }, [profile]);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    onError("");
    setIdentitySaved(false);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("/api/guest/profile/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        onError(data.error ?? "Failed to upload photo.");
        return;
      }

      onProfileChange(data.profile);
      setShowIdentityForm(true);
    } catch {
      onError("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    onError("");
    try {
      const res = await fetch("/api/guest/profile/photo", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to remove photo.");
        return;
      }
      onProfileChange(data.profile);
      setShowIdentityForm(false);
    } finally {
      setUploading(false);
    }
  };

  const saveIdentity = async () => {
    if (!guestOfHost || !guestRelationship) {
      onError("Please tell us who you are a guest of and how you know the grooms.");
      return;
    }

    setSavingIdentity(true);
    onError("");
    setIdentitySaved(false);

    try {
      const res = await fetch("/api/guest/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "identity",
          guestOfHost,
          guestRelationship,
          guestRelationshipNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to save profile details.");
        return;
      }
      onProfileChange(data.profile);
      setIdentitySaved(true);
      setShowIdentityForm(false);
    } finally {
      setSavingIdentity(false);
    }
  };

  return (
    <div
      className="rounded-3xl border bg-white/70 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 bg-[var(--wedding-bg)] shadow-sm"
          style={{ borderColor: theme.gold }}
          aria-label="Upload profile photo"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
              <Camera size={22} />
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">Add photo</span>
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition-colors group-hover:bg-black/35">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : null}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <RainbowText as="p" className="font-serif text-xl text-[var(--wedding-text-dark)]">
            {profile.name}
          </RainbowText>
          <p className="truncate text-sm text-gray-500">{profile.email}</p>
          <p className="mt-2 text-xs text-gray-500">
            Add a photo so Jarod & Jamie know who&apos;s who — especially for the guest wall.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              {profile.hasProfilePhoto ? "Change photo" : "Upload photo"}
            </button>
            {profile.hasProfilePhoto && (
              <button
                type="button"
                onClick={() => void removePhoto()}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500"
                style={{ borderColor: theme.border }}
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={PROFILE_PHOTO_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void uploadPhoto(file);
        }}
      />

      {(showIdentityForm || profile.guestOfHost || profile.guestRelationship || profile.hasProfilePhoto) && (
        <div className="mt-5 space-y-3 border-t pt-5" style={{ borderColor: theme.border }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            About you
          </p>
          <label className="block text-xs font-medium text-gray-600">
            I am a guest of
            <select
              value={guestOfHost}
              onChange={(e) => setGuestOfHost(e.target.value)}
              className={`${inputClass} mt-1`}
              style={{ borderColor: theme.border }}
            >
              <option value="">Select…</option>
              {GUEST_OF_HOST_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-gray-600">
            Relationship to the grooms
            <select
              value={guestRelationship}
              onChange={(e) => setGuestRelationship(e.target.value)}
              className={`${inputClass} mt-1`}
              style={{ borderColor: theme.border }}
            >
              <option value="">Select…</option>
              {GUEST_RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {guestRelationship === "other" && (
            <label className="block text-xs font-medium text-gray-600">
              Tell us more (optional)
              <input
                type="text"
                value={guestRelationshipNote}
                onChange={(e) => setGuestRelationshipNote(e.target.value)}
                placeholder="e.g. Jarod's hockey team"
                className={`${inputClass} mt-1`}
                style={{ borderColor: theme.border }}
              />
            </label>
          )}
          <button
            type="button"
            onClick={() => void saveIdentity()}
            disabled={savingIdentity}
            className="w-full rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            {savingIdentity ? "Saving…" : "Save guest details"}
          </button>
          {identitySaved && (
            <p className="text-center text-xs text-emerald-600">Guest details saved.</p>
          )}
        </div>
      )}
    </div>
  );
}
