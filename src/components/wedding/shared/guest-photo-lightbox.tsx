"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { GuestProfileCard } from "@/components/wedding/shared/guest-profile-card";
import {
  hasGuestProfileCard,
  type GuestProfileCardData,
} from "@/lib/guest-profile-card";

type GuestPhotoLightboxProps = {
  open: boolean;
  src: string;
  alt: string;
  profile?: GuestProfileCardData | null;
  onClose: () => void;
};

export function GuestPhotoLightbox({
  open,
  src,
  alt,
  profile,
  onClose,
}: GuestPhotoLightboxProps) {
  const showProfileCard = Boolean(profile && hasGuestProfileCard(profile));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <p className="truncate pr-4 text-xs font-bold uppercase tracking-widest text-white/70">
          {alt}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white/80 hover:bg-white/10"
          aria-label="Close full screen image"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 pb-6"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`relative w-full shrink-0 ${
            showProfileCard ? "h-[min(50vh,420px)]" : "h-[min(75vh,640px)]"
          }`}
        >
          <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" priority />
        </div>

        {showProfileCard && profile && (
          <div className="w-full max-w-sm animate-fade-in animate-slide-up">
            <GuestProfileCard profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
}
