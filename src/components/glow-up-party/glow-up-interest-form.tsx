"use client";

import { useRef, useState } from "react";
import { BucksConfetti } from "@/components/bucks-party/bucks-confetti";
import {
  GLOW_UP_BOTOX_PRICE_PER_UNIT,
  GLOW_UP_FILLER_PRICE_PER_ML,
  GLOW_UP_INTEREST_OPTIONS,
  GLOW_UP_WHITENING_OPTIONS,
  wantsPumpParty,
  wantsWhitening,
  type GlowUpInterestChoice,
  type GlowUpWhiteningPackage,
} from "@/lib/glow-up-party";

type FormState = {
  name: string;
  email: string;
  phone: string;
  interest: GlowUpInterestChoice | null;
  whiteningPackage: GlowUpWhiteningPackage | null;
  botoxUnits: string;
  fillerMl: string;
  notes: string;
  commsConsent: boolean;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  interest: null,
  whiteningPackage: null,
  botoxUnits: "",
  fillerMl: "",
  notes: "",
  commsConsent: false,
};

export function GlowUpInterestForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const submitRef = useRef<HTMLButtonElement>(null);

  function fireSnatchedBurst() {
    const rect = submitRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setBurstKey((k) => k + 1);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.interest) {
      setError("Choose which glow-up you are keen on.");
      return;
    }
    fireSnatchedBurst();
    setSubmitting(true);
    try {
      const res = await fetch("/api/glow-up-party/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          interest: form.interest,
          whiteningPackage: form.whiteningPackage,
          botoxUnits: form.botoxUnits.trim() || null,
          fillerMl: form.fillerMl.trim() || null,
          notes: form.notes || null,
          commsConsent: form.commsConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(data.message ?? "You are on the list.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const showWhitening = form.interest ? wantsWhitening(form.interest) : false;
  const showPump = form.interest ? wantsPumpParty(form.interest) : false;

  const botoxUnitsNum = Number(form.botoxUnits);
  const fillerMlNum = Number(form.fillerMl);
  const botoxEstimate =
    form.botoxUnits.trim() && Number.isFinite(botoxUnitsNum) && botoxUnitsNum > 0
      ? botoxUnitsNum * GLOW_UP_BOTOX_PRICE_PER_UNIT
      : 0;
  const fillerEstimate =
    form.fillerMl.trim() && Number.isFinite(fillerMlNum) && fillerMlNum > 0
      ? fillerMlNum * GLOW_UP_FILLER_PRICE_PER_ML
      : 0;
  const pumpEstimate = botoxEstimate + fillerEstimate;

  function formatAud(amount: number): string {
    return amount.toLocaleString("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <>
      <BucksConfetti
        fire={burstKey > 0}
        burstKey={burstKey}
        originX={origin.x}
        originY={origin.y}
        pieceCount={90}
        mode="burst"
        bannerText="Let's get SNATCHED"
        bannerStyle="pride"
        emojis={["💉", "🫦", "✨", "💅", "💋", "💖", "🌟"]}
        className="glowup-confetti-canvas"
      />

      {done ? (
        <div className="glowup-card animate-fade-in space-y-4 p-6 sm:p-8">
          <p className="glowup-label font-script text-3xl sm:text-4xl">You are glowing already ✨</p>
          <p className="glowup-muted text-base leading-relaxed">{done}</p>
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setForm(initial);
            }}
            className="glowup-label text-xs font-bold uppercase tracking-widest underline-offset-4 hover:underline"
          >
            Register another
          </button>
        </div>
      ) : (
      <form onSubmit={onSubmit} className="glowup-card space-y-7 p-5 sm:p-8">
      <div className="space-y-4">
        <label className="block">
          <span className="glowup-label mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]">
            Your name
          </span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="glowup-input min-h-12 w-full rounded-xl px-4 py-3 text-base"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="glowup-label mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]">
            Email
          </span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="glowup-input min-h-12 w-full rounded-xl px-4 py-3 text-base"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="glowup-label mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]">
            Mobile
          </span>
          <input
            required
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="04xx xxx xxx"
            className="glowup-input min-h-12 w-full rounded-xl px-4 py-3 text-base"
            autoComplete="tel"
          />
        </label>
      </div>

      <fieldset>
        <legend className="glowup-heading mb-3 font-serif text-xl sm:text-2xl">
          What are you keen on?
        </legend>
        <div className="space-y-3">
          {GLOW_UP_INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  interest: opt.value,
                  whiteningPackage: wantsWhitening(opt.value) ? f.whiteningPackage : null,
                  botoxUnits: wantsPumpParty(opt.value) ? f.botoxUnits : "",
                  fillerMl: wantsPumpParty(opt.value) ? f.fillerMl : "",
                }))
              }
              className={`glowup-poll-option min-h-14 w-full rounded-2xl px-4 py-3.5 text-left transition-transform active:scale-[0.99] ${
                form.interest === opt.value ? "is-selected" : ""
              }`}
            >
              <span className="glowup-poll-title block text-sm font-semibold">{opt.label}</span>
              <span className="glowup-poll-desc mt-0.5 block text-xs">{opt.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {showWhitening ? (
        <fieldset className="animate-fade-in">
          <legend className="glowup-heading mb-3 font-serif text-xl sm:text-2xl">
            Whitening package
          </legend>
          <div className="space-y-3">
            {GLOW_UP_WHITENING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, whiteningPackage: opt.value }))}
                className={`glowup-poll-option min-h-14 w-full rounded-2xl px-4 py-3.5 text-left transition-transform active:scale-[0.99] ${
                  form.whiteningPackage === opt.value ? "is-selected" : ""
                }`}
              >
                <span className="glowup-poll-title block text-sm font-semibold">{opt.label}</span>
                <span className="glowup-poll-desc mt-0.5 block text-xs">{opt.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {showPump ? (
        <div className="animate-fade-in space-y-4">
          <p className="glowup-heading font-serif text-xl sm:text-2xl">Botox &amp; filler amounts</p>
          <p className="glowup-muted text-xs leading-relaxed">
            Botox ${GLOW_UP_BOTOX_PRICE_PER_UNIT} per unit · filler ${GLOW_UP_FILLER_PRICE_PER_ML}{" "}
            per ml. Enter what you think you would like. You can refine on the day.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="glowup-label mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]">
                Botox units
              </span>
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={form.botoxUnits}
                onChange={(e) => setForm((f) => ({ ...f, botoxUnits: e.target.value }))}
                placeholder="e.g. 20"
                className="glowup-input min-h-12 w-full rounded-xl px-4 py-3 text-base"
              />
            </label>
            <label className="block">
              <span className="glowup-label mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]">
                Filler (ml)
              </span>
              <input
                type="number"
                min={0}
                step={0.1}
                inputMode="decimal"
                value={form.fillerMl}
                onChange={(e) => setForm((f) => ({ ...f, fillerMl: e.target.value }))}
                placeholder="e.g. 1"
                className="glowup-input min-h-12 w-full rounded-xl px-4 py-3 text-base"
              />
            </label>
          </div>
          {pumpEstimate > 0 ? (
            <div className="glowup-estimate rounded-2xl px-4 py-3 text-sm">
              <p className="glowup-label text-[10px] font-bold uppercase tracking-[0.2em]">
                Estimated total
              </p>
              <p className="glowup-estimate-total mt-1 font-serif text-2xl">
                {formatAud(pumpEstimate)}
              </p>
              <ul className="glowup-muted mt-2 space-y-0.5 text-xs">
                {botoxEstimate > 0 ? (
                  <li>
                    Botox {botoxUnitsNum} units × ${GLOW_UP_BOTOX_PRICE_PER_UNIT} ={" "}
                    {formatAud(botoxEstimate)}
                  </li>
                ) : null}
                {fillerEstimate > 0 ? (
                  <li>
                    Filler {fillerMlNum} ml × ${GLOW_UP_FILLER_PRICE_PER_ML} ={" "}
                    {formatAud(fillerEstimate)}
                  </li>
                ) : null}
              </ul>
              <p className="glowup-muted mt-2 text-[11px]">
                Estimate only: final amount depends on what you have on the day.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <label className="block">
        <span className="glowup-label mb-2 block text-[10px] font-bold uppercase tracking-[0.2em]">
          Notes <span className="glowup-muted normal-case tracking-normal">(optional)</span>
        </span>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
          className="glowup-input w-full resize-none rounded-xl px-4 py-3 text-base"
          placeholder="Questions, preferences, areas of interest"
        />
      </label>

      <label className="glowup-consent flex cursor-pointer items-start gap-3 rounded-2xl p-4">
        <input
          type="checkbox"
          checked={form.commsConsent}
          onChange={(e) => setForm((f) => ({ ...f, commsConsent: e.target.checked }))}
          className="mt-1 h-5 w-5 shrink-0"
          required
        />
        <span className="glowup-muted text-sm leading-relaxed">
          I agree to receive glow-up party details by{" "}
          <strong className="glowup-heading">email and SMS</strong>.
        </span>
      </label>

      {error ? <p className="glowup-error text-sm">{error}</p> : null}

      <button
        ref={submitRef}
        type="submit"
        disabled={submitting}
        className="glowup-cta min-h-12 w-full rounded-2xl px-5 py-3.5 text-sm font-bold uppercase tracking-widest disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Register interest"}
      </button>
    </form>
      )}
    </>
  );
}
