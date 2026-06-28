"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { GIFT_COLOUR_OPTIONS } from "@/lib/gift-colour-choices";
import { theme } from "@/lib/theme";

export function GiftColourForm() {
  const { profile, loading, error, saveSection, setError } = useGuestProfile();
  const [choice1, setChoice1] = useState("");
  const [choice2, setChoice2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setChoice1(profile.giftColourChoice1 ?? "");
    setChoice2(profile.giftColourChoice2 ?? "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choice1 || !choice2) return;

    setError("");
    setSaved(false);
    setSubmitting(true);

    const result = await saveSection("gift-colours", {
      giftColourChoice1: choice1,
      giftColourChoice2: choice2,
    });
    setSubmitting(false);
    if (result.ok) setSaved(true);
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  function ColourPicker({
    label,
    value,
    onChange,
    otherValue,
  }: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    otherValue: string;
  }) {
    return (
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {GIFT_COLOUR_OPTIONS.map((option) => {
            const selected = value === option.id;
            const disabled = otherValue === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(option.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${selected ? "ring-2 ring-[#c3a379]" : ""}`}
                style={{ borderColor: theme.border, backgroundColor: selected ? "rgba(195,163,121,0.12)" : "white" }}
                aria-pressed={selected}
              >
                <span
                  className="h-7 w-7 rounded-full border shadow-sm"
                  style={{ backgroundColor: option.swatch, borderColor: theme.border }}
                />
                <span className="text-[10px] font-medium leading-tight text-[#2a2723]">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-5 rounded-2xl border bg-white/60 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
      onSubmit={handleSubmit}
    >
      <p className="text-sm leading-relaxed text-gray-600">
        Pick your top two colours — we&apos;ll note them on your guest profile.
      </p>

      <ColourPicker label="Colour choice 1" value={choice1} onChange={setChoice1} otherValue={choice2} />
      <ColourPicker label="Colour choice 2" value={choice2} onChange={setChoice2} otherValue={choice1} />

      {error && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">{error}</p>
      )}
      {saved && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
          Colours saved — thank you!
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !choice1 || !choice2}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95 disabled:opacity-60"
        style={{ backgroundColor: theme.btnDark, color: theme.gold }}
      >
        {submitting ? "Saving..." : "Save colours"} <ChevronRight size={14} />
      </button>
    </form>
  );
}
