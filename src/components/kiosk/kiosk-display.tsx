"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { KIOSK_FEED_POLL_MS, KIOSK_SLIDE_SECONDS, type KioskSlide } from "@/lib/kiosk";

type KioskStatus = "PENDING" | "ACTIVE" | "ENDED";

function slideKindLabel(kind: KioskSlide["kind"]) {
  switch (kind) {
    case "story":
      return "Guest story";
    case "hashtag":
      return "Instagram";
    case "shared-photo":
      return "Guest upload";
    case "profile-photo":
      return "Guest moment";
  }
}

export function KioskDisplay() {
  const [feedToken, setFeedToken] = useState<string | null>(null);
  const [displayCode, setDisplayCode] = useState("");
  const [activateUrl, setActivateUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [status, setStatus] = useState<KioskStatus>("PENDING");
  const [slides, setSlides] = useState<KioskSlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [error, setError] = useState("");

  const register = useCallback(async () => {
    const stored = sessionStorage.getItem("kiosk_feed_token");
    if (stored) {
      const statusRes = await fetch(`/api/kiosk/status?token=${encodeURIComponent(stored)}`);
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (data.status !== "ENDED") {
          setFeedToken(stored);
          setDisplayCode(data.displayCode);
          setActivateUrl(
            `${window.location.origin}/kiosk/activate?code=${encodeURIComponent(data.displayCode)}`,
          );
          setStatus(data.status);
          return;
        }
      }
    }

    const res = await fetch("/api/kiosk/register", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start kiosk.");
      return;
    }

    sessionStorage.setItem("kiosk_feed_token", data.feedToken);
    setFeedToken(data.feedToken);
    setDisplayCode(data.displayCode);
    setActivateUrl(data.activateUrl);
    setStatus("PENDING");
  }, []);

  useEffect(() => {
    void register();
  }, [register]);

  useEffect(() => {
    if (!activateUrl) return;
    void QRCode.toDataURL(activateUrl, { margin: 2, width: 320 }).then(setQrDataUrl);
  }, [activateUrl]);

  useEffect(() => {
    if (!feedToken) return;

    const pollStatus = async () => {
      const res = await fetch(`/api/kiosk/status?token=${encodeURIComponent(feedToken)}`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      setDisplayCode(data.displayCode);
    };

    void pollStatus();
    const interval = window.setInterval(() => void pollStatus(), 2500);
    return () => window.clearInterval(interval);
  }, [feedToken]);

  const loadFeed = useCallback(async () => {
    if (!feedToken) return;
    const res = await fetch(`/api/kiosk/feed?token=${encodeURIComponent(feedToken)}`);
    if (!res.ok) return;
    const data = await res.json();
    setSlides(data.slides ?? []);
  }, [feedToken]);

  useEffect(() => {
    if (status !== "ACTIVE" || !feedToken) return;
    void loadFeed();
    const interval = window.setInterval(() => void loadFeed(), KIOSK_FEED_POLL_MS);
    return () => window.clearInterval(interval);
  }, [status, feedToken, loadFeed]);

  useEffect(() => {
    if (status !== "ACTIVE" || slides.length === 0) return;
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, KIOSK_SLIDE_SECONDS * 1000);
    return () => window.clearInterval(interval);
  }, [status, slides.length]);

  const currentSlide = useMemo(() => slides[slideIndex] ?? null, [slides, slideIndex]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1816] p-8 text-center text-white">
        <p>{error}</p>
      </div>
    );
  }

  if (status !== "ACTIVE" || !currentSlide) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1a1816] to-[#2a2723] px-8 text-center text-white">
        <p className="text-sm uppercase tracking-[0.35em] text-[#c3a379]">Jarod & Jamie</p>
        <h1 className="mt-4 font-serif text-5xl">Live Photo Wall</h1>
        <p className="mt-4 max-w-xl text-lg text-white/75">
          Scan with your phone while signed in as admin to start the slideshow on this TV.
        </p>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Activate kiosk QR code" className="mt-8 rounded-3xl bg-white p-4" />
        ) : (
          <div className="mt-8 h-[320px] w-[320px] animate-pulse rounded-3xl bg-white/10" />
        )}
        <p className="mt-6 font-mono text-3xl tracking-[0.5em] text-[#c3a379]">{displayCode}</p>
        <p className="mt-3 text-sm text-white/50">Waiting for admin activation…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a1816] text-white">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentSlide.imageUrl}
          alt=""
          className="h-full w-full object-cover opacity-35 blur-sm scale-105"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.name}
            className="max-h-[70vh] max-w-full rounded-[2rem] border-4 border-[#c3a379]/60 object-cover shadow-2xl"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center bg-black/45 p-8 backdrop-blur-sm lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c3a379]">
            {slideKindLabel(currentSlide.kind)}
          </p>
          <h2 className="mt-4 font-serif text-4xl lg:text-5xl">{currentSlide.name}</h2>
          {currentSlide.mood && (
            <p className="mt-3 text-sm uppercase tracking-widest text-white/60">{currentSlide.mood}</p>
          )}
          <p className="mt-6 text-xl leading-relaxed text-white/90 lg:text-2xl">{currentSlide.text}</p>
          <p className="mt-10 text-sm text-white/40">
            Slide {slideIndex + 1} of {slides.length} · refreshes live
          </p>
        </div>
      </div>
    </div>
  );
}
