"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, EyeOff, Trash2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { guestPhotoStatusLabel } from "@/lib/guest-photo-moderation";

type AdminGuestPhoto = {
  id: string;
  caption: string | null;
  status: string;
  guestName: string;
  guestEmail: string;
  createdAt: string;
  imageUrl: string;
  driveFileId: string | null;
  visionSummary: string | null;
};

type AdminGuestPhotosProps = {
  onMessage: (message: string) => void;
};

export function AdminGuestPhotos({ onMessage }: AdminGuestPhotosProps) {
  const [photos, setPhotos] = useState<AdminGuestPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guest-photos");
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error ?? "Failed to load photos.");
        return;
      }
      setPhotos(data.photos ?? []);
    } catch {
      onMessage("Failed to load photos.");
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const act = async (id: string, action: "hide" | "approve" | "delete") => {
    setActingId(id);
    try {
      const res = await fetch("/api/admin/guest-photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error ?? "Action failed.");
        return;
      }
      if (action === "delete") {
        setPhotos((current) => current.filter((photo) => photo.id !== id));
      } else {
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === id
              ? { ...photo, status: action === "hide" ? "HIDDEN" : "APPROVED" }
              : photo,
          ),
        );
      }
      onMessage(
        action === "delete"
          ? "Photo deleted."
          : action === "hide"
            ? "Photo hidden from wall."
            : "Photo approved for the TV wall.",
      );
    } catch {
      onMessage("Action failed.");
    } finally {
      setActingId(null);
    }
  };

  const pendingCount = photos.filter((p) => p.status === "PENDING").length;
  const approvedCount = photos.filter((p) => p.status === "APPROVED").length;
  const hiddenCount = photos.filter((p) => p.status === "HIDDEN").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Clean and borderline uploads go live automatically. Google Vision only blocks clearly unsafe
        images — you can still hide or delete anything from here.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Pending", value: pendingCount },
          { label: "Live", value: approvedCount },
          { label: "Hidden", value: hiddenCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-white p-3 text-center shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <p className="text-lg font-bold text-[#2a2723]">{stat.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading photos…</p>
      ) : photos.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No guest uploads yet.</p>
      ) : (
        photos.map((photo) => (
          <article
            key={photo.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <div className="flex gap-4">
              <div
                className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border"
                style={{ borderColor: theme.border }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[#2a2723]">{photo.guestName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      photo.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : photo.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {guestPhotoStatusLabel(photo.status as "PENDING" | "APPROVED" | "HIDDEN")}
                  </span>
                </div>
                {photo.caption && (
                  <p className="text-sm text-gray-600">&ldquo;{photo.caption}&rdquo;</p>
                )}
                <p className="mt-1 text-[10px] text-gray-400">
                  {new Date(photo.createdAt).toLocaleString()}
                  {photo.driveFileId ? " · saved to Drive" : ""}
                </p>
                {photo.visionSummary && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[10px] text-amber-900">
                    Vision: {photo.visionSummary}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {photo.status !== "APPROVED" && (
                <button
                  type="button"
                  disabled={actingId === photo.id}
                  onClick={() => void act(photo.id, "approve")}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 disabled:opacity-50"
                >
                  <CheckCircle size={12} /> Approve
                </button>
              )}
              {photo.status !== "HIDDEN" && (
                <button
                  type="button"
                  disabled={actingId === photo.id}
                  onClick={() => void act(photo.id, "hide")}
                  className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-700 disabled:opacity-50"
                >
                  <EyeOff size={12} /> Hide
                </button>
              )}
              <button
                type="button"
                disabled={actingId === photo.id}
                onClick={() => void act(photo.id, "delete")}
                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-700 disabled:opacity-50"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
