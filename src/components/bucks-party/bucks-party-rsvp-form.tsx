"use client";

import { useRef, useState } from "react";
import {
  BUCKS_ATTENDING_POLL,
  BUCKS_BUDGET_OPTIONS,
  type BucksBudgetChoice,
} from "@/lib/bucks-party";
import { BucksCalendarActions } from "@/components/bucks-party/bucks-calendar-actions";
import { BucksConfetti } from "@/components/bucks-party/bucks-confetti";
import { BucksShareButton } from "@/components/bucks-party/bucks-share-button";

type FormState = {
  name: string;
  email: string;
  phone: string;
  attending: boolean | null;
  plusOneName: string;
  budgetChoice: BucksBudgetChoice | null;
  commsConsent: boolean;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  attending: null,
  plusOneName: "",
  budgetChoice: null,
  commsConsent: false,
};

export function BucksPartyRsvpForm({ stripeUrl }: { stripeUrl: string | null }) {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ attending: boolean; message: string } | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const submitRef = useRef<HTMLButtonElement>(null);

  function fireLitBurst() {
    const rect = submitRef.current?.getBoundingClientRect();
    setOrigin({
      x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      y: rect ? rect.top + rect.height / 2 : window.innerHeight * 0.45,
    });
    setBurstKey((k) => k + 1);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.attending === null) {
      setError("Tell us if you're coming, darling.");
      return;
    }

    // Fire while the submit button is still on screen (same pattern as Glow-Up).
    if (form.attending) {
      fireLitBurst();
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bucks-party/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          attending: form.attending,
          plusOneName: form.plusOneName || null,
          budgetChoice: form.attending ? form.budgetChoice : null,
          commsConsent: form.commsConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone({ attending: form.attending, message: data.message ?? "RSVP saved." });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
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
        bannerText="Let's get LIT 🔥"
        bannerStyle="flame"
        emojis={["🔥", "🥂", "✨", "🎉"]}
        className="bucks-confetti-canvas"
      />

      {done ? (
        <div className="bucks-card bucks-success bucks-success-glitter animate-fade-in relative overflow-hidden space-y-5 p-6 sm:p-8">
          <div className="bucks-success-dust" aria-hidden />
          <p className="relative font-script text-3xl text-white sm:text-4xl">
            {done.attending ? "You're in, legend" : "We'll miss you"}
          </p>
          <p className="relative text-base text-white/85">{done.message}</p>

          {done.attending ? (
            <div className="relative space-y-4">
              <BucksCalendarActions />
              {stripeUrl ? (
                <div className="space-y-2">
                  <a
                    href={stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bucks-cta inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold uppercase tracking-widest text-white"
                  >
                    Prepay your place
                  </a>
                  <p className="text-center text-[11px] text-white/70">
                    Price shown includes the processing fee.
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-white/70">
                  Prepay opens closer to the date: we&apos;ll SMS and email you when it&apos;s live.
                </p>
              )}
              <div className="flex justify-center pt-1">
                <BucksShareButton />
              </div>
            </div>
          ) : (
            <div className="relative flex justify-center">
              <BucksShareButton />
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setDone(null);
              setForm(initial);
            }}
            className="relative text-xs font-bold uppercase tracking-widest text-pink-300 underline-offset-4 hover:underline"
          >
            Submit another RSVP
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="bucks-card space-y-8 p-5 sm:p-8">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300">
                Your name
              </span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="bucks-input min-h-12 w-full rounded-xl px-4 py-3 text-base text-white"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300">
                Email
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="bucks-input min-h-12 w-full rounded-xl px-4 py-3 text-base text-white"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300">
                Mobile
              </span>
              <input
                required
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="04xx xxx xxx"
                className="bucks-input min-h-12 w-full rounded-xl px-4 py-3 text-base text-white placeholder:text-white/35"
                autoComplete="tel"
              />
            </label>
          </div>

          <fieldset>
            <legend className="mb-3 font-serif text-xl text-white sm:text-2xl">
              {BUCKS_ATTENDING_POLL.question}
            </legend>
            <div className="space-y-3">
              {(
                [
                  { value: true, label: BUCKS_ATTENDING_POLL.yes },
                  { value: false, label: BUCKS_ATTENDING_POLL.no },
                ] as const
              ).map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      attending: opt.value,
                      budgetChoice: opt.value ? f.budgetChoice : null,
                    }))
                  }
                  className={`bucks-poll-option min-h-14 w-full rounded-2xl px-4 py-3.5 text-left text-sm leading-snug transition-transform active:scale-[0.99] ${
                    form.attending === opt.value ? "is-selected" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {form.attending === true && (
            <>
              <fieldset className="animate-fade-in">
                <legend className="mb-3 font-serif text-xl text-white sm:text-2xl">
                  The budget range for each person
                </legend>
                <div className="space-y-3">
                  {BUCKS_BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, budgetChoice: opt.value }))}
                      className={`bucks-poll-option min-h-14 w-full rounded-2xl px-4 py-3.5 text-left text-sm leading-snug transition-transform active:scale-[0.99] ${
                        form.budgetChoice === opt.value ? "is-selected" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block animate-fade-in">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300">
                  Plus one name{" "}
                  <span className="normal-case tracking-normal text-white/50">(optional)</span>
                </span>
                <input
                  value={form.plusOneName}
                  onChange={(e) => setForm((f) => ({ ...f, plusOneName: e.target.value }))}
                  className="bucks-input min-h-12 w-full rounded-xl px-4 py-3 text-base text-white"
                />
              </label>
            </>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
            <input
              type="checkbox"
              checked={form.commsConsent}
              onChange={(e) => setForm((f) => ({ ...f, commsConsent: e.target.checked }))}
              className="mt-1 h-5 w-5 shrink-0 accent-pink-500"
              required
            />
            <span className="text-sm leading-relaxed text-white/85">
              I agree to receive bucks party details by{" "}
              <strong className="text-white">email and SMS</strong>.
            </span>
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            ref={submitRef}
            type="submit"
            disabled={submitting}
            className="bucks-cta min-h-12 w-full rounded-2xl px-5 py-3.5 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send RSVP"}
          </button>

          {stripeUrl ? (
            <p className="text-center text-xs text-white/55">
              After you RSVP yes, you can prepay via Stripe. Price shown includes the processing fee.
            </p>
          ) : null}
        </form>
      )}
    </>
  );
}
