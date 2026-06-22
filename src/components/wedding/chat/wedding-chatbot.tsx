"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { theme } from "@/lib/theme";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STARTERS = [
  "What time is the ceremony?",
  "How do I get from Brisbane Airport?",
  "Is there a shuttle service?",
];

const WELCOME_MESSAGE =
  "Hi! I'm your wedding assistant. Ask me about the schedule, travel, accommodation, dress code, shuttles, or anything else about Jarod & Jamie's wedding.";

type WeddingChatbotProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !welcomed) {
      setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
      setWelcomed(true);
    }
  }, [open, welcomed]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setMessages(messages);
        setInput(trimmed);
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error — please try again.");
      setMessages(messages);
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
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
          className="absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-14 w-14 touch-manipulation items-center justify-center rounded-full shadow-xl transition-transform active:scale-95 sm:bottom-24"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          aria-label="Open wedding assistant"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {open && (
        <div className="absolute inset-0 z-[100] flex flex-col bg-[#f7f4ee]">
          <header
            className="wedding-screen-top flex shrink-0 items-center justify-between border-b px-5 pb-4"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.gold, color: theme.btnDark }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <p className="font-serif text-lg text-[#2a2723]">Wedding Assistant</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Ask about travel & the wedding
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-gray-400 transition-colors hover:text-[#2a2723]"
              aria-label="Close assistant"
            >
              <X size={20} />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {messages.length <= 1 && !loading && (
              <div className="space-y-2 pb-4">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => sendMessage(starter)}
                    disabled={loading}
                    className="w-full rounded-xl border bg-white px-4 py-3 text-left text-xs text-[#2a2723] shadow-sm transition-colors hover:bg-white/80 disabled:opacity-60"
                    style={{ borderColor: theme.border }}
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
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md text-white"
                        : "rounded-bl-md border bg-white text-gray-700"
                    }`}
                    style={
                      msg.role === "user"
                        ? { backgroundColor: theme.btnDark }
                        : { borderColor: theme.border }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-md border bg-white px-4 py-3 text-sm text-gray-400"
                    style={{ borderColor: theme.border }}
                  >
                    Thinking...
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
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 rounded-full border bg-[#f7f4ee] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379] disabled:opacity-60"
                style={{ borderColor: theme.border }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: theme.gold, color: theme.btnDark }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
