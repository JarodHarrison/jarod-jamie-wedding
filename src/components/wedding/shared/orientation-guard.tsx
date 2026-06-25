"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { isAppInstalled, isIosDevice } from "@/lib/pwa/install-guide";
import { theme } from "@/lib/theme";

function isTouchMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function shouldLockPortrait(): boolean {
  if (!isTouchMobile()) return false;
  if (isIosDevice()) return isAppInstalled();
  return true;
}

function isPhysicallyLandscape(): boolean {
  if (typeof window === "undefined") return false;

  const orient = window.screen.orientation;
  if (orient?.type) {
    return orient.type.startsWith("landscape");
  }

  if (typeof orient?.angle === "number") {
    const angle = Math.abs(orient.angle % 180);
    return angle === 90;
  }

  // Screen dimensions stay stable when the soft keyboard opens (unlike the viewport).
  return window.screen.width > window.screen.height;
}

export function OrientationGuard() {
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);

  useEffect(() => {
    if (!shouldLockPortrait()) return;

    const sync = () => {
      setShowRotatePrompt(isPhysicallyLandscape());
    };

    sync();
    window.screen.orientation?.addEventListener("change", sync);
    window.addEventListener("orientationchange", sync);

    const lockPortrait = async () => {
      try {
        const orientation = window.screen.orientation as ScreenOrientation & {
          lock?: (mode: string) => Promise<void>;
        };
        await orientation?.lock?.("portrait-primary");
      } catch {
        // iOS PWA can't programmatically lock — manifest + overlay handle it.
      }
    };

    void lockPortrait();

    return () => {
      window.screen.orientation?.removeEventListener("change", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  if (!showRotatePrompt) return null;

  return (
    <div
      className="orientation-guard fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-4 bg-[#f7f4ee] px-8 text-center"
      role="alert"
      aria-live="polite"
    >
      <RotateCcw size={40} style={{ color: theme.gold }} aria-hidden />
      <p className="font-serif text-xl text-gray-800">Please rotate your device</p>
      <p className="text-sm text-gray-600">This app works best in portrait mode.</p>
    </div>
  );
}
