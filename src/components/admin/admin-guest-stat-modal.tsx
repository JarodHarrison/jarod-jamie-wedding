"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  CLIENT_FILTERED_STAT_CATEGORIES,
  filterGuestsForStat,
  GUEST_STAT_LABELS,
  type GuestStatCategory,
  type GuestStatListEntry,
} from "@/lib/admin-guest-stat-lists";
import { theme } from "@/lib/theme";
import type { AdminGuest } from "@/types/wedding";

type AdminGuestStatModalProps = {
  category: GuestStatCategory | null;
  guests: AdminGuest[];
  onClose: () => void;
};

export function AdminGuestStatModal({ category, guests, onClose }: AdminGuestStatModalProps) {
  const [list, setList] = useState<GuestStatListEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!category) return;

    if (CLIENT_FILTERED_STAT_CATEGORIES.has(category)) {
      setList(filterGuestsForStat(guests, category));
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    void (async () => {
      try {
        const res = await fetch(`/api/admin/guest-lists?category=${category}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load guest list.");
          return;
        }
        setList(json.guests ?? []);
      } catch {
        setError("Failed to load guest list.");
      } finally {
        setLoading(false);
      }
    })();
  }, [category, guests]);

  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border bg-white shadow-xl"
        style={{ borderColor: theme.border }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-stat-title"
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: theme.border }}
        >
          <div>
            <h2 id="guest-stat-title" className="font-serif text-lg text-[#2a2723]">
              {GUEST_STAT_LABELS[category]}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {loading ? "Loading…" : `${list.length} guest${list.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-[#f7f4ee] hover:text-[#2a2723]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {loading && <p className="text-sm text-gray-400">Loading…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && list.length === 0 && (
            <p className="text-sm text-gray-500">No guests in this group yet.</p>
          )}

          {!loading && !error && list.length > 0 && (
            <ul className="space-y-2">
              {list.map((guest) => (
                <li
                  key={guest.id}
                  className="rounded-xl border bg-[#faf8f4] px-4 py-3 text-sm text-[#2a2723]"
                  style={{ borderColor: theme.border }}
                >
                  {guest.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export type { GuestStatCategory };
