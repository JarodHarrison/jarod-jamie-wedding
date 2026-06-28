"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { GuestPhotoLightbox } from "@/components/wedding/shared/guest-photo-lightbox";
import type { GuestProfileCardData } from "@/lib/guest-profile-card";
import { theme } from "@/lib/theme";

type WallGuest = GuestProfileCardData & {
  id: string;
  photoUrl: string;
};

type WallLightbox = {
  src: string;
  alt: string;
  profile: GuestProfileCardData;
};

export function GuestPhotoWall({ compact = false }: { compact?: boolean }) {
  const [guests, setGuests] = useState<WallGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<WallLightbox | null>(null);

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
            <button
              type="button"
              onClick={() =>
                setLightbox({
                  src: guest.photoUrl,
                  alt: guest.name,
                  profile: {
                    name: guest.name,
                    plusOneName: guest.plusOneName,
                    guestOfHost: guest.guestOfHost,
                    guestRelationship: guest.guestRelationship,
                    guestRelationshipNote: guest.guestRelationshipNote,
                  },
                })
              }
              className="mx-auto mb-1.5 block aspect-square w-full max-w-[72px] cursor-zoom-in overflow-hidden rounded-full border-2 shadow-sm"
              style={{ borderColor: theme.gold }}
              aria-label={`View ${guest.name} full screen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={guest.photoUrl} alt={guest.name} className="h-full w-full object-cover" />
            </button>
            {!compact && (
              <p className="truncate text-[10px] font-medium text-[var(--wedding-text-dark)]">{guest.name}</p>
            )}
          </div>
        ))}
      </div>

      <GuestPhotoLightbox
        open={Boolean(lightbox)}
        src={lightbox?.src ?? ""}
        alt={lightbox?.alt ?? ""}
        profile={lightbox?.profile}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
