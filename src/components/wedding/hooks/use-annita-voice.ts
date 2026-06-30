"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { plainTextForSpeech } from "@/lib/speech/plain-text";
import { CLIENT_ANNITA_SPEECH_RATE } from "@/lib/tts/speech-rate";

const SPEAK_PREF_KEY = "annita-speak";

function pickBrowserVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const ranked = [
    (v: SpeechSynthesisVoice) => /en-AU/i.test(v.lang) && /female|karen|natasha/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-GB/i.test(v.lang) && /female|sonia|martha/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-US/i.test(v.lang) && /female|samantha|zira|jenny/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
  ];

  for (const match of ranked) {
    const voice = voices.find(match);
    if (voice) return voice;
  }

  return voices[0];
}

function speakWithBrowser(text: string) {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-AU";
  utterance.rate = CLIENT_ANNITA_SPEECH_RATE;
  utterance.pitch = 1.08;

  const voice = pickBrowserVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function useAnnitaVoice() {
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setSpeakEnabled(localStorage.getItem(SPEAK_PREF_KEY) === "1");
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (raw: string) => {
      const text = plainTextForSpeech(raw);
      if (!text) return;

      stop();
      setSpeaking(true);

      try {
        const res = await fetch("/api/chat/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (res.ok && res.headers.get("content-type")?.includes("audio")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            stop();
          };
          audio.onerror = () => {
            stop();
            speakWithBrowser(text);
            setSpeaking(true);
          };

          await audio.play();
          return;
        }
      } catch {
        // fall through to browser voice
      }

      speakWithBrowser(text);
      const endTimer = window.setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          window.clearInterval(endTimer);
          setSpeaking(false);
        }
      }, 200);
    },
    [stop],
  );

  const toggleSpeak = useCallback(() => {
    setSpeakEnabled((current) => {
      const next = !current;
      localStorage.setItem(SPEAK_PREF_KEY, next ? "1" : "0");
      if (!next) stop();
      return next;
    });
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { speakEnabled, speaking, speak, stop, toggleSpeak };
}
