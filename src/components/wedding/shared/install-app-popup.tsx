"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import {
  getInstallGuideContent,
  INSTALL_GUIDE_OPEN_EVENT,
  markInstallGuideSeen,
  shouldShowInstallGuide,
  type InstallGuideContent,
} from "@/lib/pwa/install-guide";
import { theme } from "@/lib/theme";

export function InstallAppPopup() {
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState<InstallGuideContent | null>(null);

  useEffect(() => {
    if (!shouldShowInstallGuide()) return;

    setGuide(getInstallGuideContent());
    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const openGuide = () => {
      setGuide(getInstallGuideContent());
      setOpen(true);
    };
    window.addEventListener(INSTALL_GUIDE_OPEN_EVENT, openGuide);
    return () => window.removeEventListener(INSTALL_GUIDE_OPEN_EVENT, openGuide);
  }, []);

  const dismiss = () => {
    markInstallGuideSeen();
    setOpen(false);
  };

  if (!open || !guide) return null;

  return (
    <div
      className="absolute inset-0 z-[120] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-app-title"
    >
      <div
        className="max-h-[min(85dvh,640px)] w-full max-w-sm overflow-y-auto rounded-[1.75rem] border bg-white p-6 shadow-2xl"
        style={{ borderColor: theme.border }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fdf2f8] text-pink-500"
              aria-hidden="true"
            >
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                {guide.platformLabel} · {guide.browserLabel}
              </p>
              <h2 id="install-app-title" className="font-serif text-xl text-[#2a2723]">
                {guide.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:text-[#2a2723]"
            aria-label="Close install guide"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-gray-600">{guide.subtitle}</p>

        <ol className="mb-4 space-y-3">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-[#2a2723]">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: theme.gold }}
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {guide.tip && (
          <p className="mb-5 rounded-xl border bg-[#f7f4ee] px-4 py-3 text-xs leading-relaxed text-gray-600" style={{ borderColor: theme.border }}>
            <span className="font-bold uppercase tracking-wider text-[#c3a379]">Tip · </span>
            {guide.tip}
          </p>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest shadow-md transition-transform active:scale-95"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
