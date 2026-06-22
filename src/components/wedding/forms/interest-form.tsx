"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { theme } from "@/lib/theme";

type InterestField = "glowUpInterest" | "onSiteServiceInterest";

type InterestFormProps = {
  field: InterestField;
  options: { value: string; label: string }[];
};

export function InterestForm({ field, options }: InterestFormProps) {
  const { profile, loading, error, saveSection, setError } = useGuestProfile();
  const [selection, setSelection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSelection(profile[field] ?? "");
  }, [profile, field]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection) return;

    setError("");
    setSaved(false);
    setSubmitting(true);

    const payload =
      field === "glowUpInterest"
        ? { glowUpInterest: selection }
        : { onSiteServiceInterest: selection };

    const ok = await saveSection("interests", payload);
    setSubmitting(false);
    if (ok) setSaved(true);
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  return (
    <form
      className="space-y-3 rounded-2xl border bg-white/60 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
      onSubmit={handleSubmit}
    >
      <p className="text-xs text-gray-500">
        Registering as <span className="font-medium text-[#2a2723]">{profile?.name}</span>
      </p>
      <div className="relative">
        <select
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          className="w-full appearance-none rounded-xl border bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
          style={{ borderColor: theme.border }}
          required
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronRight
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 rotate-90 -translate-y-1/2 text-gray-400"
        />
      </div>
      {error && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">{error}</p>
      )}
      {saved && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
          Interest registered — thank you!
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95 disabled:opacity-60"
        style={{ backgroundColor: theme.btnDark, color: theme.gold }}
      >
        {submitting ? "Saving..." : "Register Interest"} <ChevronRight size={14} />
      </button>
    </form>
  );
}
