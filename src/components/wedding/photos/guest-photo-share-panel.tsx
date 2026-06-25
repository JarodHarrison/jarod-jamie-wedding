"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Camera, Loader2, Upload } from "lucide-react";
import { SHARED_PHOTO_ACCEPT } from "@/lib/kiosk";
import { theme } from "@/lib/theme";

export function GuestPhotoSharePanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [recent, setRecent] = useState<
    {
      id: string;
      imageUrl: string;
      caption: string | null;
      savedToDrive: boolean;
      status?: string;
    }[]
  >([]);
  const [visionSafetyEnabled, setVisionSafetyEnabled] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share-photo`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/share-photo`;

  useEffect(() => {
    void QRCode.toDataURL(shareUrl, { margin: 1, width: 180 }).then(setQrDataUrl);
    void fetch("/api/guest/photos/share")
      .then((res) => res.json())
      .then((data) => {
        setRecent(data.photos ?? []);
        setVisionSafetyEnabled(Boolean(data.visionModerationEnabled));
      })
      .catch(() => undefined);
  }, [shareUrl]);

  const upload = async (file: File) => {
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("photo", file);
      if (caption.trim()) formData.append("caption", caption.trim());

      const res = await fetch("/api/guest/photos/share", { method: "POST", body: formData });
      const data = await res.json();
      if (data.rejected) {
        setMessage(data.message ?? "That photo can't be added to the wall.");
        return;
      }
      if (!res.ok) {
        setMessage(data.error ?? "Upload failed.");
        return;
      }

      setCaption("");
      setMessage("Photo shared — it should appear on the live wall shortly.");
      setRecent((current) => [
        {
          id: data.photo.id,
          imageUrl: data.photo.imageUrl,
          caption: data.photo.caption,
          savedToDrive: false,
          status: data.photo.status,
        },
        ...current,
      ]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="rounded-2xl border bg-white/70 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
            Share a photo
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Like GuestPic — upload here or scan the QR on your table card. Photos go live on the TV wall
            right away and are saved to the couple&apos;s Google Drive when connected.
            {visionSafetyEnabled ? " Only clearly unsafe images are blocked." : ""}
          </p>
        </div>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Upload photos QR code" className="h-28 w-28 rounded-xl border bg-white p-2" />
        )}
      </div>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Optional caption for the wall…"
        className="mb-3 w-full rounded-xl border bg-white px-4 py-3 text-sm"
        style={{ borderColor: theme.border }}
        rows={2}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
        style={{ backgroundColor: theme.btnDark, color: theme.gold }}
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Uploading…" : "Upload photo"}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept={SHARED_PHOTO_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />

      {message && <p className="mt-3 text-xs text-emerald-700">{message}</p>}

      {recent.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {recent.slice(0, 6).map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-xl border" style={{ borderColor: theme.border }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.imageUrl} alt="" className="aspect-square w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
        <Camera size={12} /> Scan QR or open Photos while signed in
      </p>
    </div>
  );
}
