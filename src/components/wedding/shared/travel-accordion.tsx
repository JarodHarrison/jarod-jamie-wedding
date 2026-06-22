"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { theme } from "@/lib/theme";

export type TravelAccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type TravelAccordionProps = {
  items: TravelAccordionItem[];
  defaultOpenId?: string;
};

export function TravelAccordion({ items, defaultOpenId }: TravelAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(defaultOpenId ? [defaultOpenId] : []),
  );

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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
              <span className="text-sm font-bold leading-snug text-[#2a2723]">{item.title}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-[#c3a379] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
