"use client";

import { Heart, Mic2, Users } from "lucide-react";
import {
  guestConnectionSummary,
  type GuestProfileCardData,
} from "@/lib/guest-profile-card";
import { theme } from "@/lib/theme";

type GuestProfileCardProps = {
  profile: GuestProfileCardData;
  compact?: boolean;
};

export function GuestProfileCard({ profile, compact = false }: GuestProfileCardProps) {
  const companion = profile.plusOneName?.trim() || null;
  const connection = guestConnectionSummary(profile);
  const bio = profile.partyBio?.trim() || null;
  const roleLabel = profile.partyRoleLabel?.trim() || null;

  if (!companion && !connection && !bio) return null;

  return (
    <div
      className={`rounded-3xl border bg-[#f7f4ee]/95 text-left shadow-lg backdrop-blur-sm ${
        compact ? "p-4" : "p-5"
      }`}
      style={{ borderColor: theme.gold }}
    >
      <p className={`font-serif text-[#2a2723] ${compact ? "text-lg" : "text-xl"}`}>
        {profile.name}
      </p>
      {roleLabel && (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {roleLabel}
        </p>
      )}

      <div className={`space-y-3 ${compact ? "mt-3" : "mt-4"}`}>
        {bio && (
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white/80"
              style={{ borderColor: theme.border }}
            >
              <Mic2 size={14} className="text-[#c3a379]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bio</p>
              <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#2a2723]">
                {bio}
              </p>
            </div>
          </div>
        )}

        {companion && (
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white/80"
              style={{ borderColor: theme.border }}
            >
              <Heart size={14} className="text-[#c3a379]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Here with
              </p>
              <p className="text-sm font-medium text-[#2a2723]">{companion}</p>
            </div>
          </div>
        )}

        {connection && (
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white/80"
              style={{ borderColor: theme.border }}
            >
              <Users size={14} className="text-[#c3a379]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                How they know the grooms
              </p>
              <p className="text-sm font-medium text-[#2a2723]">{connection}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
