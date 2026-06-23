"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { ChatMessageContent } from "@/components/wedding/chat/chat-message-content";
import {
  ANNITA,
  ANNITA_DISGUSTED_LOADING_MESSAGES,
  ANNITA_INPUT_PLACEHOLDERS,
  ANNITA_LOADING_MESSAGES,
  pickAnnitaLine,
} from "@/lib/annita";
import { isDisgustingUserMessage } from "@/lib/annita-reactions";
import { getIncompleteProfileTasks } from "@/lib/guest-profile-checklist";
import { theme } from "@/lib/theme";
import type { GuestProfile } from "@/types/wedding";

type ChatSource = {
  title: string;
  url: string;
};

type AnnitaMood = "default" | "thinking" | "disgusted";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  mood?: AnnitaMood;
};

function annitaAvatarSrc(mood: AnnitaMood = "default") {
  switch (mood) {
    case "thinking":
      return ANNITA.thinkingAvatarSrc;
    case "disgusted":
      return ANNITA.disgustedAvatarSrc;
    default:
      return ANNITA.avatarSrc;
  }
}

type WeddingChatbotProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function buildWelcomeMessage(profile: GuestProfile | null): string {
  if (!profile) return ANNITA.welcomeMessage;

  const tasks = getIncompleteProfileTasks(profile);
  if (tasks.length === 0) {
    return `${ANNITA.welcomeMessage} Your forms are all complete — you're officially ready to slay, honey.`;
  }

  const required = tasks.filter((task) => task.priority === "required");
  if (required.length > 0) {
    const missing = required.map((task) => task.label.split("(")[0]?.trim() ?? task.label).join(", ");
    return `${ANNITA.welcomeMessage} I can also see you still need: ${missing}. Want me to help you fill those in right here?`;
  }

  return `${ANNITA.welcomeMessage} You've got a few optional details we could still add — just say the word, darling.`;
}

function buildStarters(profile: GuestProfile | null): string[] {
  const defaults = ANNITA.starters.slice(0, 2);
  if (!profile) return [...ANNITA.starters];

  const taskStarters = getIncompleteProfileTasks(profile)
    .slice(0, 2)
    .map((task) => task.starter);

  return [...taskStarters, ...defaults].slice(0, 4);
}

type AnnitaAvatarVariant = "fab" | "header" | "message";

function AnnitaAvatar({
  size = 36,
  className = "",
  variant = "message",
  mood = "default",
  onTap,
}: {
  size?: number;
  className?: string;
  variant?: AnnitaAvatarVariant;
  mood?: AnnitaMood;
  onTap?: () => void;
}) {
  const isHeader = variant === "header";
  const isSpecial = mood === "thinking" || mood === "disgusted";
  const src = annitaAvatarSrc(mood);
  const width = isSpecial ? (isHeader ? 120 : 96) : isHeader ? 107 : size;
  const height = isSpecial ? (isHeader ? 120 : 96) : isHeader ? 128 : size;
  const objectClass =
    mood === "thinking"
      ? "object-cover object-[50%_30%]"
      : mood === "disgusted"
        ? "object-cover object-[50%_38%]"
        : variant === "fab"
          ? "object-cover object-top"
          : "object-cover object-[50%_38%]";
  const shapeClass = isSpecial || isHeader ? "rounded-2xl" : "rounded-full";
  const ringClass =
    mood === "thinking"
      ? "ring-2 ring-pink-400 animate-pulse"
      : mood === "disgusted"
        ? "ring-2 ring-rose-500"
        : "ring-2 ring-pink-300";
  const alt =
    mood === "thinking"
      ? `${ANNITA.name} thinking`
      : mood === "disgusted"
        ? `${ANNITA.name} disgusted`
        : ANNITA.name;

  const image = (
    <div
      className={`relative shrink-0 overflow-hidden bg-pink-50 ${ringClass} ${
        onTap ? "transition-transform active:scale-95" : ""
      } ${shapeClass} ${className}`}
      style={{ width, height }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={objectClass}
        sizes={`${Math.max(width, height)}px`}
        unoptimized={isSpecial}
      />
    </div>
  );

  if (!onTap) return image;

  return (
    <button
      type="button"
      onClick={onTap}
      className="touch-manipulation"
      aria-label={`View ${ANNITA.name} full screen`}
    >
      {image}
    </button>
  );
}

function AnnitaFullscreen({
  open,
  imageSrc,
  onClose,
}: {
  open: boolean;
  imageSrc?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-[110] flex items-center justify-center bg-black/92 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${ANNITA.name} full screen`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
        aria-label="Close full screen"
      >
        <X size={22} />
      </button>
      <div
        className="relative h-full w-full max-h-full max-w-full"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={imageSrc ?? ANNITA.avatarSrc}
          alt={ANNITA.name}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
    </div>
  );
}

export function WeddingChatbot({ open: controlledOpen, onOpenChange }: WeddingChatbotProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [welcomed, setWelcomed] = useState(false);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [starters, setStarters] = useState<string[]>([...ANNITA.starters]);
  const [loadingMessage, setLoadingMessage] = useState<string>(() =>
    pickAnnitaLine(ANNITA_LOADING_MESSAGES),
  );
  const [loadingMood, setLoadingMood] = useState<AnnitaMood>("thinking");
  const [inputPlaceholder, setInputPlaceholder] = useState(() =>
    pickAnnitaLine(ANNITA_INPUT_PLACEHOLDERS),
  );
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenSrc, setFullscreenSrc] = useState<string>(ANNITA.avatarSrc);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    fetch("/api/guest/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const guestProfile = (data?.profile as GuestProfile | undefined) ?? null;
        setProfile(guestProfile);
        setStarters(buildStarters(guestProfile));

        if (!welcomed) {
          setMessages([{ role: "assistant", content: buildWelcomeMessage(guestProfile) }]);
          setWelcomed(true);
        }
        setInputPlaceholder(pickAnnitaLine(ANNITA_INPUT_PLACEHOLDERS));
      })
      .catch(() => {
        if (!welcomed) {
          setMessages([{ role: "assistant", content: ANNITA.welcomeMessage }]);
          setWelcomed(true);
        }
      });
  }, [open, welcomed]);

  useEffect(() => {
    if (!open) setFullscreenOpen(false);
  }, [open]);

  useEffect(() => {
    if (open && !fullscreenOpen) {
      inputRef.current?.focus();
    }
  }, [open, fullscreenOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    const disgusted = isDisgustingUserMessage(trimmed);
    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoadingMood(disgusted ? "disgusted" : "thinking");
    setLoadingMessage(
      pickAnnitaLine(disgusted ? ANNITA_DISGUSTED_LOADING_MESSAGES : ANNITA_LOADING_MESSAGES),
    );
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setMessages(messages);
        setInput(trimmed);
        return;
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply,
          sources: Array.isArray(data.sources) ? data.sources : undefined,
          mood: disgusted ? "disgusted" : "default",
        },
      ]);

      if (data.profileUpdated && data.profile) {
        const guestProfile = data.profile as GuestProfile;
        setProfile(guestProfile);
        setStarters(buildStarters(guestProfile));
      }

      setInputPlaceholder(pickAnnitaLine(ANNITA_INPUT_PLACEHOLDERS));
    } catch {
      setError("Network error — please try again.");
      setMessages(messages);
      setInput(trimmed);
    } finally {
      setLoading(false);
      setLoadingMood("thinking");
    }
  };

  const openAnnitaFullscreen = (src: string = ANNITA.avatarSrc) => {
    setFullscreenSrc(src);
    setFullscreenOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] right-4 z-40 touch-manipulation transition-transform active:scale-95 sm:bottom-20"
          aria-label={`Open ${ANNITA.name}`}
        >
          <AnnitaAvatar size={75} variant="fab" className="shadow-xl ring-4 ring-pink-200" />
        </button>
      )}

      {open && (
        <div className="absolute inset-0 z-[100] flex flex-col bg-[#f7f4ee]">
          <header
            className="wedding-screen-top flex shrink-0 items-center justify-between border-b px-5 pb-4"
            style={{ borderColor: theme.border, background: "linear-gradient(to right, #fdf2f8, #f7f4ee)" }}
          >
            <div className="flex items-center gap-3">
              <AnnitaAvatar
                variant="header"
                mood={loading ? loadingMood : "default"}
                onTap={() =>
                  openAnnitaFullscreen(
                    loading ? annitaAvatarSrc(loadingMood) : ANNITA.avatarSrc,
                  )
                }
              />
              <div>
                <p className="font-serif text-lg text-[#2a2723]">{ANNITA.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                  {ANNITA.tagline}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-gray-400 transition-colors hover:text-[#2a2723]"
              aria-label={`Close ${ANNITA.name}`}
            >
              <X size={20} />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {messages.length <= 1 && !loading && (
              <div className="space-y-2 pb-4">
                {starters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => sendMessage(starter)}
                    disabled={loading}
                    className="w-full rounded-xl border bg-white px-4 py-3 text-left text-xs text-[#2a2723] shadow-sm transition-colors hover:bg-pink-50 disabled:opacity-60"
                    style={{ borderColor: ANNITA.bubbleBorder }}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <AnnitaAvatar
                      size={64}
                      variant="message"
                      mood={msg.mood ?? "default"}
                      className="mb-1"
                      onTap={() => openAnnitaFullscreen(annitaAvatarSrc(msg.mood))}
                    />
                  )}
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-br-md text-white"
                          : "rounded-bl-md border text-gray-700"
                      }`}
                      style={
                        msg.role === "user"
                          ? { backgroundColor: theme.btnDark }
                          : {
                              borderColor: ANNITA.bubbleBorder,
                              backgroundColor: ANNITA.bubbleBg,
                            }
                      }
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <ChatMessageContent content={msg.content} />
                      )}
                    </div>
                    {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 px-1">
                        {msg.sources.map((source) => (
                          <a
                            key={source.url}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border bg-white px-2.5 py-1 text-[10px] text-pink-500 transition-colors hover:bg-pink-50"
                            style={{ borderColor: ANNITA.bubbleBorder }}
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2 justify-start">
                  <AnnitaAvatar
                    variant="message"
                    mood={loadingMood}
                    className="mb-1"
                    onTap={() => openAnnitaFullscreen(annitaAvatarSrc(loadingMood))}
                  />
                  <div
                    className="rounded-2xl rounded-bl-md border px-4 py-3 text-sm italic text-pink-400"
                    style={{
                      borderColor: ANNITA.bubbleBorder,
                      backgroundColor: ANNITA.bubbleBg,
                    }}
                  >
                    {loadingMessage}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="shrink-0 px-5 pb-2 text-center text-[10px] font-bold uppercase tracking-wider text-red-500">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t bg-white/90 px-4 py-4 pb-6 backdrop-blur-md"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={inputPlaceholder}
                disabled={loading}
                className="flex-1 rounded-full border bg-[#f7f4ee] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-pink-300 disabled:opacity-60"
                style={{ borderColor: ANNITA.bubbleBorder }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: ANNITA.accent, color: "white" }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

          <AnnitaFullscreen
            open={fullscreenOpen}
            imageSrc={fullscreenSrc}
            onClose={() => setFullscreenOpen(false)}
          />
        </div>
      )}
    </>
  );
}
