"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { ImageLightbox } from "@/components/wedding/shared/image-lightbox";
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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

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
              onClick={() => setLightbox({ src: guest.photoUrl, alt: guest.name })}
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

      <ImageLightbox
        open={Boolean(lightbox)}
        src={lightbox?.src ?? ""}
        alt={lightbox?.alt ?? ""}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
