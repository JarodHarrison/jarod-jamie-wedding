"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { theme } from "@/lib/theme";

type WallGuest = {
  id: string;
  name: string;
  guestOfHost: string | null;
  guestRelationship: string | null;
  photoUrl: string;
};

export function GuestPhotoWall({ compact = false }: { compact?: boolean }) {
  const [guests, setGuests] = useState<WallGuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/guests/wall");
        if (!res.ok) return;
        const data = await res.json();
        setGuests(data.guests ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-center text-xs text-gray-400">Loading guests…</p>;
  }

  if (guests.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-gray-500" style={{ borderColor: theme.border }}>
        Be the first to add your photo in Profile — then everyone can see who&apos;s coming!
      </p>
    );
  }

  const gridClass = compact
    ? "grid grid-cols-4 gap-2"
    : "grid grid-cols-3 gap-3 sm:grid-cols-4";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <Users size={12} />
        {guests.length} guest{guests.length === 1 ? "" : "s"} with photos
      </div>
      <div className={gridClass}>
        {guests.map((guest) => (
          <div key={guest.id} className="text-center">
            <div
              className="mx-auto mb-1.5 aspect-square w-full max-w-[72px] overflow-hidden rounded-full border-2 shadow-sm"
              style={{ borderColor: theme.gold }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={guest.photoUrl} alt={guest.name} className="h-full w-full object-cover" />
            </div>
            {!compact && (
              <p className="truncate text-[10px] font-medium text-[var(--wedding-text-dark)]">{guest.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
