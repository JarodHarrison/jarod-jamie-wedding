"use client";

import { BedDouble, Calendar, MapPin } from "lucide-react";
import { bedPreferenceLabel } from "@/lib/bed-preference";
import { theme } from "@/lib/theme";
import type { GuestProfile } from "@/types/wedding";

type WhereImStayingCardProps = {
  profile: Pick<
    GuestProfile,
    | "assignedRoomName"
    | "assignedRoomDetails"
    | "assignedRoomCheckIn"
    | "assignedRoomCheckOut"
    | "assignedRoomConfiguration"
    | "bedPreference"
  >;
  compact?: boolean;
  onOpenTravel?: () => void;
};

export function WhereImStayingCard({ profile, compact = false, onOpenTravel }: WhereImStayingCardProps) {
  if (!profile.assignedRoomName) return null;

  const details = profile.assignedRoomDetails?.split("\n").filter(Boolean) ?? [];

  return (
    <section
      className={`rounded-3xl border bg-gradient-to-br from-[#2a2723] via-[#3d3830] to-[#5c5348] text-white shadow-lg ${
        compact ? "p-4" : "p-5"
      }`}
      style={{ borderColor: theme.border }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c3a379]">On-site at Spicers</p>
          <h3 className={`font-serif ${compact ? "text-xl" : "text-2xl"} text-[#f7f4ee]`}>
            Where I&apos;m Staying
          </h3>
        </div>
        <div className="rounded-2xl bg-white/10 p-2.5">
          <BedDouble size={compact ? 18 : 22} className="text-[#c3a379]" />
        </div>
      </div>

      <p className="mb-1 text-lg font-semibold text-white">{profile.assignedRoomName}</p>

      {profile.assignedRoomConfiguration && (
        <p className="mb-3 text-xs uppercase tracking-wider text-white/70">
          Allocated: {profile.assignedRoomConfiguration} bed
        </p>
      )}

      {bedPreferenceLabel(profile.bedPreference) && (
        <p className="mb-3 text-xs uppercase tracking-wider text-[#c3a379]">
          Your preference: {bedPreferenceLabel(profile.bedPreference)}
        </p>
      )}

      {details.length > 0 && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
            <MapPin size={12} /> Room details
          </p>
          <ul className="space-y-1 text-sm font-light leading-relaxed text-white/85">
            {details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {(profile.assignedRoomCheckIn || profile.assignedRoomCheckOut) && (
        <div className="flex flex-wrap gap-3 text-xs text-white/80">
          {profile.assignedRoomCheckIn && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <Calendar size={12} className="text-[#c3a379]" />
              Check-in {profile.assignedRoomCheckIn}
            </span>
          )}
          {profile.assignedRoomCheckOut && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <Calendar size={12} className="text-[#c3a379]" />
              Check-out {profile.assignedRoomCheckOut}
            </span>
          )}
        </div>
      )}

      {!compact && (
        <p className="mt-4 text-xs leading-relaxed text-white/65">
          Check-in from 2pm · check-out by 10am. Spicers will email payment details separately.
        </p>
      )}

      {onOpenTravel && (
        <button
          type="button"
          onClick={onOpenTravel}
          className="mt-4 w-full rounded-2xl border border-white/15 bg-white/10 py-3 text-[10px] font-bold uppercase tracking-widest text-[#f7f4ee] transition-colors hover:bg-white/15"
        >
          Travel &amp; stay info
        </button>
      )}
    </section>
  );
}

export function useHasRoomAllocation(
  profile: Pick<GuestProfile, "assignedRoomName"> | null | undefined,
): boolean {
  return Boolean(profile?.assignedRoomName);
}
