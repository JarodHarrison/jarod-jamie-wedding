"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { theme } from "@/lib/theme";

export type ContentAccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type ContentAccordionProps = {
  items: ContentAccordionItem[];
  defaultOpenId?: string;
  /** Allow multiple panels open at once */
  multiple?: boolean;
};

export function ContentAccordion({
  items,
  defaultOpenId,
  multiple = true,
}: ContentAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(defaultOpenId ? [defaultOpenId] : []),
  );

  const toggle = (id: string) => {
    setOpenIds((current) => {
      if (multiple) {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      return current.has(id) ? new Set() : new Set([id]);
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border bg-white/80 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-white"
            >
              <span className="text-sm font-bold leading-snug text-[var(--wedding-text-dark)]">
                {item.title}
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-[var(--wedding-gold)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div
                className="border-t px-4 pb-4 pt-3 text-sm font-light leading-relaxed text-gray-600"
                style={{ borderColor: theme.border }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
